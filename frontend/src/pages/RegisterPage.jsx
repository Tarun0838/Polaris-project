import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Compass, User, Mail, Lock, Building2 } from 'lucide-react';
import { register } from '../store/slices/authSlice';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    institution: ''
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    const result = await dispatch(register(formData));
    if (register.fulfilled.match(result)) {
      toast.success('Registration successful!');
      navigate('/');
    } else {
      toast.error(result.payload || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-cyan-500/40 mx-auto flex items-center justify-center shadow-md">
            <Compass className="w-7 h-7 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
            Create VYOM Account
          </h1>
          <p className="text-xs font-semibold text-cyan-700 tracking-wide">
            Beyond Boundaries. Beyond Limits.
          </p>
          <p className="text-xs text-slate-500">
            Join India's Polar Knowledge & Outreach Network • Beyond Boundary, Beyond Limits
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="Dr. Researcher or Student Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="user@university.edu.in"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600"
              >
                <option value="student">Student Learner</option>
                <option value="researcher">Polar Researcher / Scientist</option>
                <option value="public">General Public Member</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Institution / University</label>
              <input
                type="text"
                placeholder="e.g., IIT Delhi, Delhi University, NCPOR"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 font-medium"
              />
            </div>

            <Button
              variant="polar"
              size="md"
              type="submit"
              disabled={loading}
              className="w-full text-xs font-bold py-2.5"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </Button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Already have an account? </span>
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
