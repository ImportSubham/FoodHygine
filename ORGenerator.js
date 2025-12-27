import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Download } from 'lucide-react';
import { AuthContext } from '../App';
import { api, setAuthToken } from '../utils/api';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export default function QRGenerator() {
  const { token } = useContext(AuthContext);
  const [stalls, setStalls] = useState([]);
  const [selectedStall, setSelectedStall] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      fetchUserStalls();
    }
  }, [token]);
  const fetchUserStalls = async () => {
    try {
      const response = await api.get('/stalls');
      const userStalls = response.data;
      setStalls(userStalls);
    } catch (error) {
       toast.error('Failed to fetch stalls');
    }
  };
   const generateQRCode = async () => {
    if (!selectedStall) {
      toast.error('Please select a stall');
      return;
    }
      setLoading(true);
    try {
      const response = await api.get(`/qrcode/${selectedStall}`);
      setQrData(response.data);
       toast.success('QR Code generated!');
    } catch (error) {
      toast.error('Failed to generate QR code');
      } finally {
      setLoading(false);
    }
      };

  const downloadQRCode = () => {
    if (!qrData) return;

    const link = document.createElement('a');
    link.download = `hygiene-qr-${qrData.stall.name}.png`;
    link.href = qrData.qr_code;
     link.click();
  };
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
              <Link to="/profile">
                <Button variant="ghost" data-testid="profile-link">Back to Profile</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
       <div className="bg-white p-8 rounded-2xl border border-slate-100">
          <h1 className="text-3xl font-bold text-slate-900 mb-6" data-testid="qr-generator-title">Generate QR Code</h1>
          <p className="text-slate-600 mb-8">Create a QR code displaying your stall's hygiene score to showcase at your location.</p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Your Stall</label>
              <Select value={selectedStall} onValueChange={setSelectedStall}>
                <SelectTrigger className="w-full" data-testid="stall-select">
      <SelectValue placeholder="Choose a stall" />
                </SelectTrigger>
                <SelectContent>
                  {stalls.map((stall) => (
                    <SelectItem key={stall.id} value={stall.id} data-testid={`stall-option-${stall.id}`}>
                      {stall.name} - Score: {stall.overall_score.toFixed(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
 </div>

            <Button 
              onClick={generateQRCode}
              disabled={loading || !selectedStall}
              className="w-full bg-teal-700 hover:bg-teal-800 rounded-full py-6 text-lg"
              data-testid="generate-qr-button"
            >
              {loading ? 'Generating...' : 'Generate QR Code'}
</Button>

            {qrData && (
              <div className="mt-8 p-6 bg-slate-50 rounded-xl" data-testid="qr-code-display">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{qrData.stall.name}</h3>
                  <p className="text-slate-600">Hygiene Score: <span className="font-bold text-teal-700 text-2xl mono">{qrData.stall.overall_score.toFixed(1)}/5.0</span></p>
                </div>
   <div className="bg-white p-6 rounded-xl flex justify-center mb-4">
                  <img src={qrData.qr_code} alt="QR Code" className="w-64 h-64" data-testid="qr-code-image" />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="text-center">
                    <p className="text-slate-500">Water Quality</p>
                    <p className="font-semibold text-lg">{qrData.stall.water_quality_score.toFixed(1)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-500">Masks</p>
    <p className="font-semibold text-lg">{qrData.stall.masks_score.toFixed(1)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-500">Gloves</p>
                    <p className="font-semibold text-lg">{qrData.stall.gloves_score.toFixed(1)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-500">Cleanliness</p>
                    <p className="font-semibold text-lg">{qrData.stall.cleanliness_score.toFixed(1)}</p>
                  </div>
  </div>

                <Button 
                  onClick={downloadQRCode}
                  className="w-full bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center gap-2"
                  data-testid="download-qr-button"
                >
                  <Download className="w-5 h-5" />
                       Download QR Code
                </Button>

                <p className="text-center text-sm text-slate-500 mt-4">
                  Print and display this QR code at your stall to show customers your hygiene rating.
                       </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

     
