import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/authContext';
import { loginRequest } from '../api/auth';
import { Input } from '../components/input';
import { Button } from '../components/button';
import { LogIn } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

   
  try {
    const res = await loginRequest(email, password);
    
    console.log('Full response:', res);          // See the whole response
    console.log('Response data:', res.data);     // See the data shape

    const token = res.data.access_token;
    const user = res.data.user;

    console.log('Token:', token);                // Is token extracted?
    console.log('User:', user);                  // Is user extracted?
    console.log('User role:', user?.role);       // What role is coming back?

    login(token, user);

    const destination = user.role === 'admin' ? '/admin/dashboard' : '/staff/dashboard';
    console.log('Navigating to:', destination);  // Where is it trying to go?
    
    navigate(destination);

  } catch (err: any) {
    console.log('Error:', err);
    console.log('Error response:', err.response?.data);
    setError(err.response?.data?.error || 'Login failed');
  } finally {
    setLoading(false);
  }};

   return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
              <LogIn className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
              Transport MS
            </h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              placeholder="admin@au.int"
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
              <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-xl text-sm">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} fullWidth>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50/50 rounded-xl">
            <p className="text-xs text-gray-600 font-semibold mb-2">Demo Accounts:</p>
            <p className="text-xs text-gray-600">Admin: admin@au.int</p>
            <p className="text-xs text-gray-600">Dispatcher: dispatcher@au.int</p>
            <p className="text-xs text-gray-500 mt-1 italic">Password: Password1!</p>
          </div>
        </div>
      </div>
    </div>
  );
};
