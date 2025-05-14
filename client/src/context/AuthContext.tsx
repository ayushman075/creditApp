/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
import { useSignIn, useSignUp, useUser, useClerk, useAuth } from "@clerk/clerk-react";
import Cookies from "js-cookie";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

// Define interfaces for our context data
interface UserData {
  emailId: string | null;
  role: string | null;
  userId: string | null;
  name: string | null;
}

interface AuthContextType {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  isSignedIn: boolean | undefined;
  signUp: ReturnType<typeof useSignUp>["signUp"];
  register: (email: string, password: string, navigate: null) => Promise<void>;
  token: string | null;
  googleLogin: () => Promise<void>;
  handleOAuthCallback: () => Promise<void>;
  user: ReturnType<typeof useUser>["user"];
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Create the context with initial undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { getToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData>({
    emailId: null,
    role: null,
    userId: null,
    name:null
  });

  useEffect(() => {
    const fetchToken = async () => {
      const authToken = await getToken();
      setToken(authToken);
      if (authToken) {
        Cookies.set('authToken', authToken);
      }
    };
    fetchToken();
  }, [getToken]);

  const { signOut, handleRedirectCallback } = useClerk();
  const { user, isSignedIn } = useUser();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();

  const login = async (email: string, password: string) => {
    try {
      await signIn?.create({
        identifier: email,
        password,
      });
      // Note: Using Navigate like this doesn't work - we'll address this later
       <Navigate to={"/dashboard"} />
     window.location.reload();
    } catch (err) {
      toast.error("Error Logging in, Please try again");
      console.error("Login failed:", err);
    }
  };

  const logout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully!");
      // Note: Using Navigate like this doesn't work - we'll address this later
      // <Navigate to={"/"} />
    } catch (err) {
      toast.error("Error logging out, please try again.");
      console.error("Logout failed:", err);
    }
  };

  const register = async (email: string, password: string, navigate: null) => {
    try {
      await signUp?.create({ emailAddress: email, password });
      toast.success("Account created successfully! Please log in.");
      <Navigate to={'/dashboard'}/>
      window.location.reload()
    } catch (err) {
      <Navigate to={'/dashboard'}/>
      window.location.reload()

      toast.error("Error creating account, please try again.");
      console.error("Sign up failed:", err);
    }
  };

  const googleLogin = async () => {
    try {
      await signIn?.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "https://credit-app-jl8y.vercel.app/oauth-callback",
        redirectUrlComplete:"https://credit-app-jl8y.vercel.app/dashboard"
      });
    } catch (err) {
      toast.error("Error with Google login, please try again.");
      console.error("Google login failed:", err);
    }
  };

  const handleOAuthCallback = async () => {
    try {
      await handleRedirectCallback({
        afterSignInUrl: "/dashboard",
        afterSignUpUrl: "/dashboard"
      });
      toast.success("Google login successful!");
      // Note: Using Navigate like this doesn't work - we'll address this later
       <Navigate to={"/dashboard"}/>
    } catch (err) {
      toast.error("Error processing Google login.");
      console.error("OAuth callback failed:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      userData, 
      setUserData, 
      isSignedIn, 
      signUp, 
      register, 
      token, 
      googleLogin, 
      handleOAuthCallback, 
      user, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthData = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthData must be used within an AuthProvider");
  }
  return context;
};