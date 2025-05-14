import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSignUp } from "@clerk/clerk-react";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Eye, EyeOff } from 'lucide-react';
import type { OAuthStrategy } from "@clerk/types";
import { FcGoogle } from 'react-icons/fc';
import { useAuthData } from '@/context/AuthContext';

const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {isSignedIn} = useAuthData()

  const { signUp, isLoaded } = useSignUp();
  const navigate = useNavigate();

  useEffect(()=>{
    if(isLoaded&& isSignedIn){
      navigate('/dashboard',{replace:true})
    }
  },[isLoaded,isSignedIn])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (!isLoaded) return;

    setIsLoading(true);

    try {
      const result = await signUp.create({
        emailAddress: email,
        password: password,
      });

      // Send verification email
      await result.prepareEmailAddressVerification({ strategy: "email_code" });

      // Redirect to verify email page
      navigate('/verify-email', { 
        state: { 
          email, 
          signUpAttempt: result 
        } 
      });
    } catch (err: any) {
      console.error('Sign up error:', err);
      toast.error(err.errors?.[0]?.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignUp = async (strategy: OAuthStrategy) => {
    if (!isLoaded) return;

    try {
      await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: "/oauth-callback",
        redirectUrlComplete: "/dashboard"
      });
    } catch (err: any) {
      console.error('OAuth sign up error:', err);
      toast.error(err.errors?.[0]?.message || 'OAuth sign up failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center items-center gap-2">
            <CreditCard className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-2xl">Create Your Account</CardTitle>
          </div>
          <CardDescription>
            Join CreditApp and get access to quick, hassle-free loans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <Input 
                type="email" 
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Input 
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>
          
          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
            <span className="mx-4 text-gray-500 dark:text-gray-400 text-sm">or</span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
          </div>
          
          <div className="grid gap-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => handleOAuthSignUp("oauth_google")}
            >
              <FcGoogle />
              Sign up with Google
            </Button>
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <a 
              href="/login" 
              className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
            >
              Log in
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpPage;