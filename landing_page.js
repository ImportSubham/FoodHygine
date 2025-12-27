import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Search, Star, MapPin, TrendingUp, X } from 'lucide-react';
import { AuthContext } from '../App';
import { api, setAuthToken } from '../utils/api';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export default function LandingPage() {
   const navigate = useNavigate();
  const { user, login } = useContext(AuthContext);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [searchQuery, setSearchQuery] = useState('');

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '' });
   const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', loginData);
      const { token, user } = response.data;
      setAuthToken(token);
      login(token, user);
      toast.success('Welcome back!');
       setShowAuth(false);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/register', registerData);
       const { token, user } = response.data;
      setAuthToken(token);
      login(token, user);
      toast.success('Account created successfully!');
      setShowAuth(false);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    }
  };
  
  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/dashboard?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="glassmorphism sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
              <ShieldCheck className="w-8 h-8 text-teal-700" />
              <span className="text-2xl font-bold text-slate-900">HygieneHero</span>
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link to="/dashboard" data-testid="dashboard-link">
                    <Button variant="ghost">Dashboard</Button>
                  </Link>
                  <Link to="/leaderboard" data-testid="leaderboard-link">
                    <Button variant="ghost">Leaderboard</Button>
                  </Link>
                  <Link to="/profile" data-testid="profile-link">
                    <Button className="bg-teal-700 hover:bg-teal-800 rounded-full">Profile</Button>
                  </Link>
                </>
              ) : (
                <Button onClick={() => setShowAuth(true)} className="bg-teal-700 hover:bg-teal-800 rounded-full" data-testid="get-started-btn">
                  Get Started
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1734158168943-d4f727a3e925" 
            alt="Background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6" data-testid="hero-title">
            Eat Safe, <span className="text-teal-700">Trust Verified</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
            Discover food stalls with verified hygiene ratings. Rate, review, and help your community make safer dining choices.
          </p>
          
          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex gap-2" data-testid="search-bar">
              <Input
                type="text"
                placeholder="Search by city, area, or stall name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="h-14 text-lg rounded-full"
                data-testid="search-input"
              />
              <Button 
                onClick={handleSearch}
                className="bg-teal-700 hover:bg-teal-800 h-14 px-8 rounded-full"
                data-testid="search-button"
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 hover:border-teal-200 transition-all" data-testid="feature-rate">
              <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-teal-700" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Rate & Review</h3>
              <p className="text-slate-600">Share your experience with detailed hygiene ratings on water quality, masks, gloves, and cleanliness.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border border-slate-100 hover:border-teal-200 transition-all" data-testid="feature-discover">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Discover Locally</h3>
              <p className="text-slate-600">Find the highest-rated food stalls in your area with detailed hygiene scores and community reviews.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border border-slate-100 hover:border-teal-200 transition-all" data-testid="feature-qr">
              <div className="bg-sky-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-sky-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">QR Code Display</h3>
              <p className="text-slate-600">Stall owners can generate QR codes with their hygiene scores to display at their locations.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Why Hygiene Matters</h2>
            <p className="text-lg text-slate-600">Transparent ratings help everyone make informed decisions</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <img 
                src="https://images.pexels.com/photos/5964489/pexels-photo-5964489.jpeg"
                alt="Chef with proper hygiene"
                className="rounded-2xl shadow-lg w-full"
              />
            </div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="bg-teal-700 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Water Quality</h3>
                  <p className="text-slate-600">Clean water is essential for food preparation and washing.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-teal-700 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Protective Gear</h3>
                  <p className="text-slate-600">Masks and gloves protect food from contamination.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-teal-700 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Overall Cleanliness</h3>
                  <p className="text-slate-600">Clean cooking areas and utensils ensure food safety.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">Ready to Make a Difference?</h2>
          <p className="text-lg text-slate-600 mb-8">Join our community of food safety advocates</p>
          <Button 
            onClick={() => user ? navigate('/dashboard') : setShowAuth(true)}
            className="bg-teal-700 hover:bg-teal-800 text-lg px-8 py-6 rounded-full"
            data-testid="cta-button"
          >
            {user ? 'Go to Dashboard' : 'Get Started Now'}
          </Button>
        </div>
      </section>

      <footer className="bg-slate-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ShieldCheck className="w-6 h-6" />
            <span className="text-xl font-bold">HygieneHero</span>
          </div>
          <p className="text-slate-400">Making food safety transparent, one rating at a time.</p>
        </div>
      </footer>

      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="sm:max-w-md" data-testid="auth-dialog">
          <button 
            onClick={() => setShowAuth(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
            data-testid="close-auth-dialog"
          >
            <X className="h-4 w-4" />
          </button>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Welcome to HygieneHero</DialogTitle>
          </DialogHeader>
          
          <Tabs value={authMode} onValueChange={setAuthMode} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-testid="login-tab">Login</TabsTrigger>
              <TabsTrigger value="register" data-testid="register-tab">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4" data-testid="login-form">
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                    className="input-field"
                    data-testid="login-email"
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    className="input-field"
                    data-testid="login-password"
                  />
                </div>
                <Button type="submit" className="w-full bg-teal-700 hover:bg-teal-800 rounded-full" data-testid="login-submit">
                  Login
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4" data-testid="register-form">
                <div>
                  <Input
                    type="text"
                    placeholder="Full Name"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    required
                    className="input-field"
                    data-testid="register-name"
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                    className="input-field"
                    data-testid="register-email"
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                    className="input-field"
                    data-testid="register-password"
                  />
                </div>
                <Button type="submit" className="w-full bg-teal-700 hover:bg-teal-800 rounded-full" data-testid="register-submit">
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
