import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/authContext';
import { loginRequest, googleOAuthLogin } from '../api/auth';
import { Input } from '../components/input';
import { useGoogleLogin } from '@react-oauth/google';
import au_logo from '../../public/au.jfif';

export const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [gLoading, setGLoading] = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const redirectByRole = (role: string) => {
  switch (role) {
    case 'admin':                 return navigate('/admin/dashboard');
    case 'dispatcher':
    case 'dispatcher_supervisor': return navigate('/staff/dispatch');
    case 'driver':                return navigate('/staff/trips');
    case 'supervisor':
    case 'director':              return navigate('/staff/review');
    default:                      return navigate('/staff/dashboard');
  }
};

  // Normal email/password login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res   = await loginRequest(email, password);
      const token = res.data.access_token;
      const user  = res.data.user;
      login(token, user);
      redirectByRole(user.role);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth login
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGLoading(true);
      setError('');
      try {
        // Get user profile from Google using the access token
        const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const profile = await profileRes.json();

        // Send to our backend
      const res = await googleOAuthLogin({
  email:      profile.email,
  first_name: profile.given_name || profile.name || 'User',
  last_name: profile.family_name || '-',
  uid:        profile.sub,
  avatar_url: profile.picture || '',
});

        const token = res.data.access_token;
        const user  = res.data.user;
        login(token, user);
        redirectByRole(user.role);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Google login failed. Try again.');
      } finally {
        setGLoading(false);
      }
    },
    onError: () => {
      setError('Google login was cancelled or failed.');
    },
  });

  return (
    <div className="min-h-screen flex" style={{ background: '#f0f4f0' }}>

      {/* Left Panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-2/5 p-12"
        style={{ background: 'linear-gradient(160deg, #005a2d 0%, #006233 55%, #004d27 100%)' }}
      >
        <div className="flex items-center gap-3">
          <img src={au_logo} alt="AU Logo" className="shrink-0 rounded-lg object-cover"
            style={{ width: 40, height: 40 }} />
          <div>
            <p className="font-bold text-white text-base">Transport MS</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>African Union</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-white leading-tight">
            AU Vehicle Transport<br />Service Management
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)' }} className="text-sm leading-relaxed">
            Streamline transport requisitions, approvals, and dispatching across all AU departments.
          </p>
          <div className="space-y-2 pt-2">
            {[
              'Department-based request routing',
              'Real-time dispatch & driver tracking',
              'Multi-role approval workflow',
            ].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs shrink-0"
                  style={{ background: '#FFC107', color: '#004d27' }}>✓</span>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.75)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          © {new Date().getFullYear()} African Union · AIS-ADD/ETH
        </p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <img src={au_logo} alt="AU Logo" className="shrink-0 rounded-lg object-cover"
              style={{ width: 40, height: 40 }} />
            <p className="font-bold text-gray-800 text-lg">Transport MS</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-8" style={{ borderColor: '#e5ede8' }}>
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-gray-800">Sign in</h1>
              <p className="text-sm text-gray-500 mt-1">Access your Transport MS account</p>
            </div>

            {/* Google Sign In Button */}
            <button
              onClick={() => handleGoogleLogin()}
              disabled={gLoading || loading}
              className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 mb-4"
              style={{ borderColor: '#dadce0' }}
            >
              {gLoading ? (
                <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  <path fill="none" d="M0 0h48v48H0z"/>
                </svg>
              )}
              {gLoading ? 'Signing in...' : 'Continue with Google'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">or sign in with email</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Email/Password form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                label="Email address"
                placeholder="your@au.int"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || gLoading}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50"
                style={{ background: loading ? '#004d27' : '#006233' }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Demo accounts */}
            <div className="mt-6 p-4 rounded-xl" style={{ background: '#f7faf8', border: '1px solid #e5ede8' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: '#006233' }}>Demo Accounts</p>
              <div className="space-y-1 text-xs text-gray-500">
                <p><span className="font-medium text-gray-700">Admin:</span> admin@au.int</p>
                <p><span className="font-medium text-gray-700">Supervisor:</span> hr.supervisor@au.int</p>
                <p><span className="font-medium text-gray-700">Dispatcher:</span> dispatcher@au.int</p>
                <p><span className="font-medium text-gray-700">Driver:</span> driver1@au.int</p>
                <p className="mt-1 italic" style={{ color: '#006233' }}>Password: Password1!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};