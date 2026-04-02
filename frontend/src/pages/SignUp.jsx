import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthHeader, Footer } from '../components/ui';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // TODO: Implement signup API call
      console.log('Sign up with:', formData);
      // For now, redirect to login
      navigate('/login');
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col selection:bg-secondary selection:text-white relative">
      <AuthHeader />
      
      {/* Decorative Background Element */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[80vw] h-[80vh] pointer-events-none opacity-40">
        <div className="w-full h-full bg-gradient-to-br from-surface-container-low via-white to-surface-container-highest blur-3xl rounded-full"></div>
      </div>

      <main className="flex-grow flex items-center justify-center pt-24 pb-32 px-6">
        <div className="w-full max-w-[420px] bg-white border border-outline-variant/10 p-10 rounded-xl shadow-[0_40px_80px_-20px_rgba(27,28,28,0.04)]">
          <div className="mb-10 text-center">
            <h1 className="font-headline text-4xl tracking-tight text-primary mb-3">
              Get started
            </h1>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Precision utility for your scheduling workflow.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Full Name Field */}
            <div className="space-y-2">
              <label 
                className="block text-[10px] uppercase tracking-widest font-medium text-on-surface-variant" 
                htmlFor="fullName"
              >
                Full Name
              </label>
              <input 
                className={`w-full px-4 py-3 bg-surface-container-low border-0 focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-all duration-200 text-sm text-on-surface placeholder:text-gray-400 rounded-md ${errors.fullName ? 'ring-1 ring-error' : ''}`}
                id="fullName" 
                name="fullName" 
                placeholder="John Doe" 
                type="text"
                value={formData.fullName}
                onChange={handleChange}
              />
              {errors.fullName && (
                <p className="text-error text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label 
                className="block text-[10px] uppercase tracking-widest font-medium text-on-surface-variant" 
                htmlFor="email"
              >
                Institution Email
              </label>
              <input 
                className={`w-full px-4 py-3 bg-surface-container-low border-0 focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-all duration-200 text-sm text-on-surface placeholder:text-gray-400 rounded-md ${errors.email ? 'ring-1 ring-error' : ''}`}
                id="email" 
                name="email" 
                placeholder="john@university.edu" 
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="text-error text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label 
                  className="block text-[10px] uppercase tracking-widest font-medium text-on-surface-variant" 
                  htmlFor="password"
                >
                  Password
                </label>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                  Min. 8 characters
                </span>
              </div>
              <input 
                className={`w-full px-4 py-3 bg-surface-container-low border-0 focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-all duration-200 text-sm text-on-surface placeholder:text-gray-400 rounded-md ${errors.password ? 'ring-1 ring-error' : ''}`}
                id="password" 
                name="password" 
                placeholder="••••••••" 
                type="password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className="text-error text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button 
              className="w-full bg-primary text-on-primary py-4 rounded-md font-semibold text-sm hover:opacity-90 active:opacity-80 transition-all duration-200 mt-4 flex items-center justify-center gap-2" 
              type="submit"
            >
              Create Account
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </form>

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
