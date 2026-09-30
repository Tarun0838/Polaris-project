import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Compass,
  Search,
  BookOpen,
  MapPin,
  Ship,
  FileText,
  Database,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { logout, setDemoUser } from '../store/slices/authSlice';

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleNavSearch = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/explore?q=${encodeURIComponent(navSearch.trim())}`);
      setNavSearch('');
      setMobileMenuOpen(false);
    }
  };

  const handleDemoSwitch = async (role) => {
    const demoConfigs = {
      admin: {
        id: '674843000000000000000001',
        name: 'Dr. M. Ravichandran',
        email: 'admin@vyom.demo',
        role: 'admin',
        institution: 'Ministry of Earth Sciences (MoES)'
      },
      researcher: {
        id: '674843000000000000000002',
        name: 'Dr. Rohit Srivastava',
        email: 'researcher@vyom.demo',
        role: 'researcher',
        institution: 'National Centre for Polar and Ocean Research (NCPOR)'
      },
      student: {
        id: '674843000000000000000003',
        name: 'Aarav Sharma',
        email: 'student@vyom.demo',
        role: 'student',
        institution: 'Indian Institute of Technology (IIT) Delhi'
      }
    };

    const target = demoConfigs[role] || demoConfigs.researcher;

    try {
      const res = await api.post('/auth/login', { email: target.email, password: 'polaris123' });
      if (res.data && res.data.token) {
        dispatch(setDemoUser({ user: res.data.user, token: res.data.token }));
        toast.success(`Switched to ${res.data.user.name}`);
        setDemoMenuOpen(false);
        return;
      }
    } catch (err) {
      // Fallback if offline
    }

    dispatch(setDemoUser({ user: target, token: 'demo-jwt-token-active' }));
    toast.success(`Switched to ${target.name}`);
    setDemoMenuOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/explore' },
    { name: 'Polar Map', path: '/map' },
    { name: 'Expeditions', path: '/expeditions' },
    { name: 'Datasets', path: '/datasets' },
    { name: 'Publications', path: '/publications' },
    { name: 'Media', path: '/media' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Ministry Bar */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1 px-4 sm:px-8 flex justify-between items-center tracking-wide">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-100">GOVERNMENT OF INDIA</span>
          <span className="text-slate-500">•</span>
          <span>Ministry of Earth Sciences (MoES)</span>
          <span className="hidden md:inline text-slate-500">•</span>
          <span className="hidden md:inline">NCPOR & National Polar Data Centre</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-slate-300 font-medium">Smart Education | SIH26063</span>
          {/* Quick Demo Switcher */}
          <div className="relative">
            <button
              onClick={() => setDemoMenuOpen(!demoMenuOpen)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-700 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3 h-3 text-teal-400" />
              <span>Role: <strong className="text-white capitalize">{user?.role || 'Guest'}</strong></span>
              <ChevronDown className="w-2.5 h-2.5" />
            </button>

            {demoMenuOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white text-slate-800 rounded-md shadow-lg border border-slate-200 py-1 z-50 text-xs">
                <div className="px-3 py-1 font-semibold text-slate-400 uppercase text-[10px]">Switch Demo Persona</div>
                <button
                  onClick={() => handleDemoSwitch('admin')}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between"
                >
                  <span>Admin / Curator</span>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Full RBAC</span>
                </button>
                <button
                  onClick={() => handleDemoSwitch('researcher')}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between"
                >
                  <span>Polar Scientist</span>
                  <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">NCPOR</span>
                </button>
                <button
                  onClick={() => handleDemoSwitch('student')}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between"
                >
                  <span>Student Learner</span>
                  <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">IIT</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-slate-900 border border-cyan-500/40 flex items-center justify-center shadow-xs group-hover:border-cyan-400 transition-colors">
              <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9" fill="#0EA5E9" fillOpacity="0.2" />
                <circle cx="12" cy="12" r="2" fill="#38BDF8" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight font-heading">VYOM</span>
                <span className="bg-blue-100/80 text-blue-800 text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase">MoES</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight hidden sm:block font-medium">Beyond Boundaries. Beyond Limits.</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  isActive(link.path)
                    ? 'text-blue-700 bg-blue-50/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {(user?.role === 'researcher' || user?.role === 'admin') && (
              <Link
                to="/media-studio"
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${
                  isActive('/media-studio')
                    ? 'text-cyan-800 bg-cyan-100/90'
                    : 'text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                Media Studio
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${
                  isActive('/admin')
                    ? 'text-amber-800 bg-amber-100/90'
                    : 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin Dashboard
              </Link>
            )}
          </nav>

          {/* Search & Actions */}
          <div className="hidden md:flex items-center gap-3">
            <form onSubmit={handleNavSearch} className="relative">
              <input
                type="text"
                placeholder="Search research, datasets..."
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                className="w-44 lg:w-56 pl-8 pr-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-md focus:outline-hidden focus:bg-white focus:border-blue-500 focus:w-64 transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </form>

            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="text-right">
                  <div className="text-xs font-medium text-slate-800 leading-tight">{user?.name}</div>
                  <div className="text-[10px] text-slate-500 capitalize">{user?.role}</div>
                </div>
                <button
                  onClick={() => dispatch(logout())}
                  title="Logout"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-md"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleNavSearch} className="relative mb-3">
            <input
              type="text"
              placeholder="Search polar research..."
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-md"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
          </form>

          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 text-xs font-medium rounded-md ${
                  isActive(link.path)
                    ? 'text-blue-700 bg-blue-50 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {(user?.role === 'researcher' || user?.role === 'admin') && (
              <Link
                to="/media-studio"
                onClick={() => setMobileMenuOpen(false)}
                className="col-span-2 px-3 py-2 text-xs font-semibold rounded-md text-cyan-800 bg-cyan-50 border border-cyan-200"
              >
                Media Studio
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="col-span-2 px-3 py-2 text-xs font-semibold rounded-md text-amber-800 bg-amber-50 border border-amber-200"
              >
                Admin Dashboard
              </Link>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            {isAuthenticated ? (
              <>
                <div className="text-xs">
                  <div className="font-semibold text-slate-800">{user?.name}</div>
                  <div className="text-slate-500 capitalize">{user?.role}</div>
                </div>
                <button
                  onClick={() => dispatch(logout())}
                  className="text-xs text-rose-600 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-xs font-medium bg-slate-900 text-white rounded-md"
              >
                Sign In to VYOM
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
