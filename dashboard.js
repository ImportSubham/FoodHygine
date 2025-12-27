import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ShieldCheck, Search, Plus, MapPin, Star } from 'lucide-react';
import { AuthContext } from '../App';
import { api, setAuthToken } from '../utils/api';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export default function Dashboard() {
   const navigate = useNavigate();
  const { user, token, logout } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [cityFilter, setCityFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');

  useEffect(() => {
    if (token) {
      setAuthToken(token);
    }
  }, [token]);
   useEffect(() => {
    fetchStalls();
  }, [searchParams]);

  const fetchStalls = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      const search = searchParams.get('search');
      if (search) params.append('search', search);
       if (cityFilter) params.append('city', cityFilter);
      if (areaFilter) params.append('area', areaFilter);
      
      const response = await api.get(`/stalls?${params.toString()}`);
      setStalls(response.data);
    } catch (error) {
      toast.error('Failed to fetch stalls');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    navigate(`/dashboard?${params.toString()}`);
  };
  const handleFilter = () => {
    fetchStalls();
  };

  const getScoreColor = (score) => {
    if (score >= 4) return 'bg-teal-700';
    if (score >= 3) return 'bg-orange-500';
    return 'bg-red-500';
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
     <Link to="/leaderboard" data-testid="leaderboard-nav-link">
                <Button variant="ghost">Leaderboard</Button>
              </Link>
              {user && (
                <>
                  <Link to="/add-stall" data-testid="add-stall-nav-link">
                    <Button className="bg-orange-500 hover:bg-orange-600 rounded-full flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Add Stall
                    </Button>
                  </Link>
                  <Link to="/profile" data-testid="profile-nav-link">
                    <Button variant="ghost">{user.name}</Button>
                </Link>
                  <Button onClick={logout} variant="ghost" data-testid="logout-button">Logout</Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4" data-testid="dashboard-title">Discover Food Stalls</h1>
          <p className="text-lg text-slate-600">Find hygiene-rated food stalls in your area</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 mb-8" data-testid="search-filter-section">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                type="text"
                placeholder="Search stalls..."
                value={searchQuery}
   onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="input-field"
                data-testid="search-input-dashboard"
              />
            </div>
            <div>
              <Input
                type="text"
                placeholder="City"
                value={cityFilter}
  onChange={(e) => setCityFilter(e.target.value)}
                className="input-field"
                data-testid="city-filter-input"
              />
            </div>
            <div>
                   <Input
                type="text"
                placeholder="Area"
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="input-field"
                data-testid="area-filter-input"
              />
                   </div>
          </div>
          <div className="flex gap-4 mt-4">
            <Button onClick={handleFilter} className="bg-teal-700 hover:bg-teal-800 rounded-full" data-testid="apply-filter-button">
              Apply Filters
            </Button>
            <Button 
              onClick={() => {
                setSearchQuery('');
                setCityFilter('');
                setAreaFilter('');
                 navigate('/dashboard');
              }}
              variant="outline"
              className="rounded-full"
              data-testid="clear-filter-button"
            >
              Clear
            </Button>
          </div>
        </div>
 {loading ? (
          <div className="text-center py-12" data-testid="loading-spinner">Loading...</div>
        ) : stalls.length === 0 ? (
          <div className="text-center py-12" data-testid="no-stalls-message">
            <p className="text-slate-600 text-lg mb-4">No stalls found</p>
            {user && (
              <Link to="/add-stall">
                <Button className="bg-teal-700 hover:bg-teal-800 rounded-full">
                  Add First Stall
                </Button>
              </Link>
               )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="stalls-grid">
            {stalls.map((stall) => (
              <div
                key={stall.id}
                onClick={() => navigate(`/stall/${stall.id}`)}
                className="stall-card"
                data-testid={`stall-card-${stall.id}`}
              >
 {stall.photos && stall.photos.length > 0 ? (
                  <img src={stall.photos[0]} alt={stall.name} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-slate-200 flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-slate-400" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-slate-900 flex-1" data-testid={`stall-name-${stall.id}`}>{stall.name}</h3>
                    <div className={`score-badge text-sm ${getScoreColor(stall.overall_score)}`} data-testid={`stall-score-${stall.id}`}>
                      {stall.overall_score.toFixed(1)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{stall.area}, {stall.city}</span>
                  </div>
                  <p className="text-slate-600 text-sm line-clamp-2 mb-3">{stall.description}</p>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                         <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>{stall.rating_count} ratings</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
