import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleOneTap, useSignIn } from "@clerk/clerk-react";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Eye, EyeOff } from 'lucide-react';
import type { OAuthStrategy } from "@clerk/types";
import { FcGoogle } from "react-icons/fc";
import { useAuthData } from '@/context/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, isLoaded } = useSignIn();
  const navigate = useNavigate();


   const {isSignedIn} = useAuthData()




  useEffect(()=>{
    if(isLoaded&& isSignedIn){
      navigate('/dashboard',{replace:true})
    }
  },[isLoaded,isSignedIn])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    
    
    // Basic validation
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!isLoaded) return;

    setIsLoading(true);

    try {
      const result = await signIn.create({
        identifier: email,
        password: password,
      });

      // Check if sign-in is complete
      if (result.status === 'complete') {
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        // Handle additional steps like 2FA
        console.log(result);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      toast.error(err.errors?.[0]?.message || 'Failed to log in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (strategy: OAuthStrategy) => {
    if (!isLoaded) return;

    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: "/oauth-callback",
        redirectUrlComplete: "/dashboard"
      });
    } catch (err: any) {
      console.error('OAuth login error:', err);
      toast.error(err.errors?.[0]?.message || 'OAuth login failed');
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center items-center gap-2">
            <CreditCard className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
          </div>
          <CardDescription>
            Log in to access your CreditApp account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
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
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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
            
            <Button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={isLoading}
            >
              
              {isLoading ? 'Logging In...' : 'Log In'}
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
              onClick={() => handleOAuthLogin("oauth_google")}
            >
            <FcGoogle />
              Log in with Google
            </Button>
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <a 
              href="/signup" 
              className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
            >
              Sign up
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;