import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthHeader, Footer } from '../components/ui';

const Login = () => {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, just trigger Google OAuth (can add email/password later)
    login();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center">
        <div className="text-on-surface">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest text-on-surface flex flex-col min-h-screen">
      <AuthHeader />
      
      <main className="flex-grow flex items-center justify-center px-6 py-12 mt-16">
        <div className="w-full max-w-[420px] bg-surface-container-lowest p-0 md:p-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-headline text-primary tracking-tight mb-2">
              Log in to your account
            </h1>
            <p className="text-on-surface-variant text-sm body-md">
              Enter your credentials to manage your schedules.
            </p>
          </div>

          {error === 'auth_failed' && (
            <div className="mb-6 p-4 bg-error-container rounded-lg">
              <p className="text-error text-sm text-center">
                Authentication failed. Please try again.
              </p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label 
                className="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2" 
                htmlFor="email"
              >
                Email Address
              </label>
              <input 
                className="w-full px-4 py-3 bg-surface-container-low border-0 focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-all duration-200 text-sm outline-none rounded-md" 
                id="email" 
                name="email" 
                placeholder="name@company.com" 
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label 
                  className="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant" 
                  htmlFor="password"
                >
                  Password
                </label>
                <a 
                  className="text-[10px] uppercase tracking-widest font-bold text-secondary hover:underline transition-all" 
                  href="#"
                >
                  Forgot password?
                </a>
              </div>
              <input 
                className="w-full px-4 py-3 bg-surface-container-low border-0 focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-all duration-200 text-sm outline-none rounded-md" 
                id="password" 
                name="password" 
                placeholder="••••••••" 
                type="password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <button 
              className="w-full bg-primary text-on-primary py-3.5 px-4 font-semibold text-sm tracking-tight hover:opacity-90 active:scale-[0.98] transition-all duration-200 rounded-md" 
              type="submit"
            >
              Sign in
            </button>
          </form>

          <div className="relative my-10">
            <div aria-hidden="true" className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant opacity-20"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
              <span className="bg-surface-container-lowest px-4 text-on-surface-variant">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={login}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-outline-variant border-opacity-30 hover:bg-surface-container-low transition-colors text-sm font-medium rounded-md"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81.38z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-outline-variant border-opacity-30 hover:bg-surface-container-low transition-colors text-sm font-medium rounded-md">
              <span className="material-symbols-outlined text-[18px]">key</span>
              SAML
            </button>
          </div>

          <p className="mt-8 text-center text-xs text-on-surface-variant">
            Don't have an account? 
            <Link className="font-bold text-primary hover:underline ml-1" to="/signup">
              Create an account
            </Link>
          </p>
        </div>
      </main>

      <Footer fixed />
    </div>
  );
};

export default Login;
