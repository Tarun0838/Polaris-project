import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Compass, ShieldCheck, User, Lock, ArrowRight } from 'lucide-react';
import { login, setDemoUser } from '../store/slices/authSlice';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.user.name}!`);
      if (result.payload.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      toast.error(result.payload || 'Invalid credentials.');
    }
  };

  const handleQuickDemo = (role) => {
    if (role === 'admin') {
      setEmail('admin@polaris.demo');
      setPassword('polaris123');
    } else if (role === 'researcher') {
      setEmail('researcher@polaris.demo');
      setPassword('polaris123');
    } else if (role === 'student') {
      setEmail('student@polaris.demo');
      setPassword('polaris123');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Card */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-cyan-500/40 mx-auto flex items-center justify-center shadow-md">
            <Compass className="w-7 h-7 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
            Sign In to VYOM
          </h1>
          <p className="text-xs text-slate-500">
            Ministry of Earth Sciences • Beyond Boundary, Beyond Limits
          </p>
        </div>

        {/* Demo Fast-Switch Buttons */}
        <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 space-y-2">
          <div className="text-[11px] font-bold text-blue-900 uppercase flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
            <span>Hackathon Jury Demo Login (1-Click Fill)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="py-1.5 px-2 bg-white hover:bg-slate-50 border border-slate-200 rounded text-[11px] font-semibold text-slate-800 transition-colors shadow-2xs"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('researcher')}
              className="py-1.5 px-2 bg-white hover:bg-slate-50 border border-slate-200 rounded text-[11px] font-semibold text-slate-800 transition-colors shadow-2xs"
            >
              🔬 Scientist
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('student')}
              className="py-1.5 px-2 bg-white hover:bg-slate-50 border border-slate-200 rounded text-[11px] font-semibold text-slate-800 transition-colors shadow-2xs"
            >
              🎓 Student
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Official Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="admin@polaris.demo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 font-medium"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 font-medium"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <Button
              variant="polar"
              size="md"
              type="submit"
              disabled={loading}
              className="w-full text-xs font-bold py-2.5"
            >
              {loading ? 'Authenticating...' : 'Sign In to Account'}
            </Button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Don't have an account yet? </span>
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
