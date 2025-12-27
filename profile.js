import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, User, Mail, QrCode, LogOut } from 'lucide-react';
import { AuthContext } from '../App';
import { Button } from '../components/ui/button';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
     logout();
    navigate('/');
  };

  if (!user) {
    return null;
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
              <Link to="/dashboard">
                <Button variant="ghost" data-testid="dashboard-link">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
   <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-100">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-teal-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-4xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2" data-testid="user-name">{user.name}</h1>
            <p className="text-slate-600" data-testid="user-email">{user.email}</p>
 </div>

          <div className="space-y-4 mb-8">
            <div className="p-4 bg-slate-50 rounded-xl flex items-center gap-4">
              <User className="w-6 h-6 text-teal-700" />
              <div>
                <p className="text-sm text-slate-500">Name</p>
                <p className="font-medium text-slate-900">{user.name}</p>
</div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl flex items-center gap-4">
              <Mail className="w-6 h-6 text-teal-700" />
              <div>
                <p className="text-sm text-slate-500">Email</p>
                <p className="font-medium text-slate-900">{user.email}</p>
</div>
            </div>
          </div>

          <div className="space-y-4">
            <Link to="/qr-generator">
              <Button className="w-full bg-teal-700 hover:bg-teal-800 rounded-full flex items-center justify-center gap-2" data-testid="qr-generator-button">
                <QrCode className="w-5 h-5" />
               Generate QR Code for My Stall
              </Button>
            </Link>

            <Button 
              onClick={handleLogout}
variant="outline"
              className="w-full rounded-full flex items-center justify-center gap-2 border-red-500 text-red-500 hover:bg-red-50"
              data-testid="logout-button"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
