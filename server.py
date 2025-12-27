from fastapi import FastAPI, APIRouter, HTTPException, Depends, File, UploadFile, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import base64
from io import BytesIO
import qrcode

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 720

security = HTTPBearer()

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
  return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_id: str, email: str) -> str:
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_jwt_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
       raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Token expired')
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token')

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_jwt_token(token)
    user = await db.users.find_one({'id': payload['user_id']}, {'_id': 0})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='User not found')
    return user

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    role: str = 'user'
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
  class Stall(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    address: str
    city: str
    area: str
    photos: List[str] = []
    water_quality_score: float = 0.0
    masks_score: float = 0.0
    gloves_score: float = 0.0
    cleanliness_score: float = 0.0
    overall_score: float = 0.0
    rating_count: int = 0
    owner_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StallCreate(BaseModel):
    name: str
    description: str
   address: str
    city: str
    area: str
    photos: List[str] = []

class Rating(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    stall_id: str
    user_id: str
    user_name: str
    water_quality: float
    masks: float
    gloves: float
   cleanliness: float
    overall: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RatingCreate(BaseModel):
    stall_id: str
    water_quality: float = Field(ge=1, le=5)
    masks: float = Field(ge=1, le=5)
    gloves: float = Field(ge=1, le=5)
    cleanliness: float = Field(ge=1, le=5)

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
   model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    stall_id: str
    user_id: str
    user_name: str
    comment: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReviewCreate(BaseModel):
    stall_id: str
    comment: str

@api_router.post("/auth/register")
async def register(user_input: UserRegister):
    existing = await db.users.find_one({'email': user_input.email}, {'_id': 0})
    if existing:
        raise HTTPException(status_code=400, detail='Email already registered')
    
    user = User(
        name=user_input.name,
        email=user_input.email
    )
    user_dict = user.model_dump()
    user_dict['password_hash'] = hash_password(user_input.password)
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.users.insert_one(user_dict)
  token = create_jwt_token(user.id, user.email)
    return {'token': token, 'user': user.model_dump()}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({'email': credentials.email}, {'_id': 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail='Invalid credentials')
    
    if not verify_password(credentials.password, user_doc['password_hash']):
        raise HTTPException(status_code=401, detail='Invalid credentials')
     token = create_jwt_token(user_doc['id'], user_doc['email'])
    
    user_data = {k: v for k, v in user_doc.items() if k != 'password_hash'}
    if isinstance(user_data.get('created_at'), str):
        user_data['created_at'] = datetime.fromisoformat(user_data['created_at'])
    
    return {'token': token, 'user': user_data}

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {k: v for k, v in current_user.items() if k != 'password_hash'}

@api_router.post("/stalls", response_model=Stall)
async def create_stall(stall_input: StallCreate, current_user: dict = Depends(get_current_user)):
   stall = Stall(
        name=stall_input.name,
        description=stall_input.description,
        address=stall_input.address,
        city=stall_input.city,
        area=stall_input.area,
        photos=stall_input.photos,
        owner_id=current_user['id']
    )
stall_dict = stall.model_dump()
    stall_dict['created_at'] = stall_dict['created_at'].isoformat()
    
    await db.stalls.insert_one(stall_dict)
    return stall

@api_router.get("/stalls", response_model=List[Stall])
async def get_stalls(city: Optional[str] = None, area: Optional[str] = None, search: Optional[str] = None):
    query = {}
    if city:
        query['city'] = {'$regex': city, '$options': 'i'}
    if area:
       query['area'] = {'$regex': area, '$options': 'i'}
    if search:
        query['$or'] = [
            {'name': {'$regex': search, '$options': 'i'}},
            {'description': {'$regex': search, '$options': 'i'}},
            {'city': {'$regex': search, '$options': 'i'}},
            {'area': {'$regex': search, '$options': 'i'}}
        ]
    
    stalls = await db.stalls.find(query, {'_id': 0}).sort('overall_score', -1).to_list(1000)
    
    for stall in stalls:
       if isinstance(stall.get('created_at'), str):
            stall['created_at'] = datetime.fromisoformat(stall['created_at'])
    
    return stalls

@api_router.get("/stalls/{stall_id}", response_model=Stall)
async def get_stall(stall_id: str):
    stall = await db.stalls.find_one({'id': stall_id}, {'_id': 0})
    if not stall:
        raise HTTPException(status_code=404, detail='Stall not found')
    
    if isinstance(stall.get('created_at'), str):
        stall['created_at'] = datetime.fromisoformat(stall['created_at'])
      return stall

@api_router.post("/ratings", response_model=Rating)
async def create_rating(rating_input: RatingCreate, current_user: dict = Depends(get_current_user)):
    stall = await db.stalls.find_one({'id': rating_input.stall_id}, {'_id': 0})
    if not stall:
        raise HTTPException(status_code=404, detail='Stall not found')
    
    existing_rating = await db.ratings.find_one({
        'stall_id': rating_input.stall_id,
        'user_id': current_user['id']
       }, {'_id': 0})
    
    overall = (rating_input.water_quality + rating_input.masks + rating_input.gloves + rating_input.cleanliness) / 4
    
    rating = Rating(
        stall_id=rating_input.stall_id,
        user_id=current_user['id'],
        user_name=current_user['name'],
        water_quality=rating_input.water_quality,
        masks=rating_input.masks,
        gloves=rating_input.gloves,
        cleanliness=rating_input.cleanliness,
        overall=overall
    )
rating_dict = rating.model_dump()
    rating_dict['created_at'] = rating_dict['created_at'].isoformat()
    
    if existing_rating:
        await db.ratings.update_one(
            {'stall_id': rating_input.stall_id, 'user_id': current_user['id']},
            {'$set': rating_dict}
        )
      else:
        await db.ratings.insert_one(rating_dict)
    
    all_ratings = await db.ratings.find({'stall_id': rating_input.stall_id}, {'_id': 0}).to_list(1000)
    
    avg_water = sum(r['water_quality'] for r in all_ratings) / len(all_ratings)
    avg_masks = sum(r['masks'] for r in all_ratings) / len(all_ratings)
    avg_gloves = sum(r['gloves'] for r in all_ratings) / len(all_ratings)
    avg_cleanliness = sum(r['cleanliness'] for r in all_ratings) / len(all_ratings)
    avg_overall = (avg_water + avg_masks + avg_gloves + avg_cleanliness) / 4
  await db.stalls.update_one(
        {'id': rating_input.stall_id},
        {'$set': {
            'water_quality_score': round(avg_water, 2),
            'masks_score': round(avg_masks, 2),
            'gloves_score': round(avg_gloves, 2),
            'cleanliness_score': round(avg_cleanliness, 2),
            'overall_score': round(avg_overall, 2),
            'rating_count': len(all_ratings)
        }}
      )
    
    return rating

@api_router.get("/ratings/stall/{stall_id}", response_model=List[Rating])
async def get_stall_ratings(stall_id: str):
    ratings = await db.ratings.find({'stall_id': stall_id}, {'_id': 0}).to_list(1000)
    
    for rating in ratings:
        if isinstance(rating.get('created_at'), str):
            rating['created_at'] = datetime.fromisoformat(rating['created_at'])
            return ratings

@api_router.post("/reviews", response_model=Review)
async def create_review(review_input: ReviewCreate, current_user: dict = Depends(get_current_user)):
    stall = await db.stalls.find_one({'id': review_input.stall_id}, {'_id': 0})
    if not stall:
        raise HTTPException(status_code=404, detail='Stall not found')
    
    review = Review(
        stall_id=review_input.stall_id,
        user_id=current_user['id'],
        user_name=current_user['name'],
        comment=review_input.comment
       )
    
    review_dict = review.model_dump()
    review_dict['created_at'] = review_dict['created_at'].isoformat()
    
    await db.reviews.insert_one(review_dict)
    return review

@api_router.get("/reviews/stall/{stall_id}", response_model=List[Review])
async def get_stall_reviews(stall_id: str):
    reviews = await db.reviews.find({'stall_id': stall_id}, {'_id': 0}).sort('created_at', -1).to_list(1000)
  
    for review in reviews:
        if isinstance(review.get('created_at'), str):
            review['created_at'] = datetime.fromisoformat(review['created_at'])
    
    return reviews

@api_router.get("/leaderboard")
async def get_leaderboard(city: Optional[str] = None, area: Optional[str] = None):
    query = {}
    if city:
       query['city'] = {'$regex': city, '$options': 'i'}
    if area:
        query['area'] = {'$regex': area, '$options': 'i'}
    
    stalls = await db.stalls.find(query, {'_id': 0}).sort('overall_score', -1).limit(50).to_list(50)
    
    for stall in stalls:
        if isinstance(stall.get('created_at'), str):
            stall['created_at'] = datetime.fromisoformat(stall['created_at'])
    
    return stalls

@api_router.get("/qrcode/{stall_id}")
async def generate_qr_code(stall_id: str):
    stall = await db.stalls.find_one({'id': stall_id}, {'_id': 0})
    if not stall:
        raise HTTPException(status_code=404, detail='Stall not found')
    
    qr_data = f"Hygiene Score: {stall.get('overall_score', 0):.1f}/5.0\nWater: {stall.get('water_quality_score', 0):.1f} | Masks: {stall.get('masks_score', 0):.1f} | Gloves: {stall.get('gloves_score', 0):.1f} | Clean: {stall.get('cleanliness_score', 0):.1f}\nStall: {stall['name']}"
    
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(qr_data)
    qr.make(fit=True)
     img = qr.make_image(fill_color="black", back_color="white")
    
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    return {'qr_code': f'data:image/png;base64,{img_base64}', 'stall': stall}

@api_router.post("/upload-photo")
async def upload_photo(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
   if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail='File must be an image')
    
    contents = await file.read()
    img_base64 = base64.b64encode(contents).decode('utf-8')
    data_url = f'data:{file.content_type};base64,{img_base64}'
    
    return {'url': data_url}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
