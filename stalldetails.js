import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Star, Droplets, Hand, ShieldAlert, Sparkles, MessageSquare } from 'lucide-react';
import { AuthContext } from '../App';
import { api, setAuthToken } from '../utils/api';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Slider } from '../components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';

export default function StallDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const [stall, setStall] = useState(null);
  const [stall, setStall] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [comment, setComment] = useState('');
  
  const [rating, setRating] = useState({
    water_quality: 3,
    masks: 3,
    gloves: 3,
    cleanliness: 3
  });
   useEffect(() => {
    if (token) {
      setAuthToken(token);
    }
    fetchStallDetails();
  }, [id, token]);

  const fetchStallDetails = async () => {
    try {
      setLoading(true);
      const [stallRes, reviewsRes] = await Promise.all([
        api.get(`/stalls/${id}`),
        api.get(`/reviews/stall/${id}`)
         ]);
      setStall(stallRes.data);
      setReviews(reviewsRes.data);
    } catch (error) {
      toast.error('Failed to fetch stall details');
    } finally {
      setLoading(false);
    }
  };
const handleSubmitRating = async () => {
    if (!user) {
      toast.error('Please login to rate');
      return;
    }

    try {
      await api.post('/ratings', {
        stall_id: id,
         ...rating
      });
      toast.success('Rating submitted successfully!');
      setShowRatingDialog(false);
      fetchStallDetails();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit rating');
    }
  };

  const handleSubmitReview = async () => {
     if (!user) {
      toast.error('Please login to review');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
       await api.post('/reviews', {
        stall_id: id,
        comment: comment
      });
      toast.success('Review submitted successfully!');
      setComment('');
      fetchStallDetails();
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };
  const getScoreColor = (score) => {
    if (score >= 4) return 'text-teal-700 bg-teal-100';
    if (score >= 3) return 'text-orange-500 bg-orange-100';
    return 'text-red-500 bg-red-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="loading-spinner">
        Loading...
      </div>
    );
  }

  if (!stall) {
    return <div className="flex items-center justify-center min-h-screen">Stall not found</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
     <nav className="glassmorphism sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-teal-700" />
              <span className="text-2xl font-bold text-slate-900">HygieneHero</span>
            </Link>
            <div className="flex items-center gap-4">
              <Button onClick={() => navigate(-1)} variant="ghost" data-testid="back-button">Back</Button>
              <Link to="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {stall.photos && stall.photos.length > 0 ? (
              <img src={stall.photos[0]} alt={stall.name} className="w-full h-96 object-cover rounded-2xl mb-6" />
            ) : (
              <div className="w-full h-96 bg-slate-200 rounded-2xl flex items-center justify-center mb-6">
                <MapPin className="w-24 h-24 text-slate-400" />
              </div>
            )}

            <div className="bg-white p-8 rounded-2xl border border-slate-100 mb-6">
              <h1 className="text-3xl font-bold text-slate-900 mb-4" data-testid="stall-name">{stall.name}</h1>
              <div className="flex items-center gap-2 text-slate-600 mb-4">
                <MapPin className="w-5 h-5" />
                <span data-testid="stall-location">{stall.address}, {stall.area}, {stall.city}</span>
              </div>
              <p className="text-slate-600" data-testid="stall-description">{stall.description}</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-100" data-testid="reviews-section">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Reviews ({reviews.length})</h2>
              
              {user && (
                <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                  <Textarea
                    placeholder="Share your experience..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="mb-4"
                    data-testid="review-textarea"
                  />
                  <Button onClick={handleSubmitReview} className="bg-teal-700 hover:bg-teal-800 rounded-full" data-testid="submit-review-button">
                    Post Review
                  </Button>
                </div>
              )}

              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="p-4 bg-slate-50 rounded-xl" data-testid={`review-${review.id}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-teal-700 text-white rounded-full flex items-center justify-center font-semibold">
                        {review.user_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold">{review.user_name}</span>
                    </div>
                    <p className="text-slate-600">{review.comment}</p>
                  </div>
                ))}
                {reviews.length === 0 && (
                  <p className="text-center text-slate-500 py-8" data-testid="no-reviews-message">No reviews yet. Be the first to review!</p>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 sticky top-24" data-testid="hygiene-score-card">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Hygiene Score</h2>
              
              <div className="flex items-center justify-center mb-8">
                <div className="w-32 h-32 bg-teal-700 text-white rounded-full flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold mono" data-testid="overall-score">{stall.overall_score.toFixed(1)}</span>
                  <span className="text-sm">/ 5.0</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Droplets className="w-5 h-5 text-sky-500" />
                    <span className="font-medium">Water Quality</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full font-semibold mono ${getScoreColor(stall.water_quality_score)}`} data-testid="water-quality-score">
                    {stall.water_quality_score.toFixed(1)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="w-5 h-5 text-orange-500" />
                    <span className="font-medium">Masks</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full font-semibold mono ${getScoreColor(stall.masks_score)}`} data-testid="masks-score">
                    {stall.masks_score.toFixed(1)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Hand className="w-5 h-5 text-teal-500" />
                    <span className="font-medium">Gloves</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full font-semibold mono ${getScoreColor(stall.gloves_score)}`} data-testid="gloves-score">
                    {stall.gloves_score.toFixed(1)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    <span className="font-medium">Cleanliness</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full font-semibold mono ${getScoreColor(stall.cleanliness_score)}`} data-testid="cleanliness-score">
                    {stall.cleanliness_score.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="text-center text-sm text-slate-500 mb-4">
                Based on {stall.rating_count} ratings
              </div>

              {user && (
                <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center gap-2" data-testid="rate-stall-button">
                      <Star className="w-4 h-4" /> Rate This Stall
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg" data-testid="rating-dialog">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold">Rate Hygiene Factors</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-4">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Droplets className="w-5 h-5 text-sky-500" />
                            <span className="font-medium">Water Quality</span>
                          </div>
                          <span className="font-bold mono text-lg">{rating.water_quality}</span>
                        </div>
                        <Slider
                          value={[rating.water_quality]}
                          onValueChange={([value]) => setRating({ ...rating, water_quality: value })}
                          min={1}
                          max={5}
                          step={0.5}
                          className="w-full"
                          data-testid="water-quality-slider"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-orange-500" />
                            <span className="font-medium">Masks</span>
                          </div>
                          <span className="font-bold mono text-lg">{rating.masks}</span>
                        </div>
                        <Slider
                          value={[rating.masks]}
                          onValueChange={([value]) => setRating({ ...rating, masks: value })}
                          min={1}
                          max={5}
                          step={0.5}
                          className="w-full"
                          data-testid="masks-slider"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Hand className="w-5 h-5 text-teal-500" />
                            <span className="font-medium">Gloves</span>
                          </div>
                          <span className="font-bold mono text-lg">{rating.gloves}</span>
                        </div>
                        <Slider
                          value={[rating.gloves]}
                          onValueChange={([value]) => setRating({ ...rating, gloves: value })}
                          min={1}
                          max={5}
                          step={0.5}
                          className="w-full"
                          data-testid="gloves-slider"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-yellow-500" />
                            <span className="font-medium">Cleanliness</span>
                          </div>
                          <span className="font-bold mono text-lg">{rating.cleanliness}</span>
                        </div>
                        <Slider
                          value={[rating.cleanliness]}
                          onValueChange={([value]) => setRating({ ...rating, cleanliness: value })}
                          min={1}
                          max={5}
                          step={0.5}
                          className="w-full"
                          data-testid="cleanliness-slider"
                        />
                      </div>
                    </div>

                    <Button onClick={handleSubmitRating} className="w-full bg-teal-700 hover:bg-teal-800 rounded-full" data-testid="submit-rating-button">
                      Submit Rating
                    </Button>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
