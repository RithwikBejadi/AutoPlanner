import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthHeader, Footer } from '../components/ui';

const SignUp = () => {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center">
        <div className="text-on-surface">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col selection:bg-secondary selection:text-white relative">
      <AuthHeader />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[80vw] h-[80vh] pointer-events-none opacity-40">
        <div className="w-full h-full bg-gradient-to-br from-surface-container-low via-white to-surface-container-highest blur-3xl rounded-full"></div>
      </div>

      <main className="flex-grow flex items-center justify-center pt-24 pb-32 px-6">
        <div className="w-full max-w-[420px] bg-white border border-outline-variant/10 p-10 rounded-xl shadow-[0_40px_80px_-20px_rgba(27,28,28,0.04)]">
          <div className="mb-10 text-center">
            <h1 className="font-headline text-4xl tracking-tight text-primary mb-3">
              Create your account
            </h1>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Sign up instantly with Google OAuth.
            </p>
          </div>

          <button
            type="button"
            onClick={login}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-outline-variant border-opacity-30 hover:bg-surface-container-low transition-colors text-sm font-medium rounded-md"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81.38z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
            </svg>
            Continue with Google
          </button>

          <div className="mt-10 pt-8 border-t border-outline-variant/10 text-center">
            <p className="text-sm text-on-surface-variant">
              Already have an account?
              <Link
                className="text-primary font-semibold hover:underline underline-offset-4 decoration-1 ml-1"
                to="/login"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer fixed />
    </div>
  );
};

export default SignUp;
