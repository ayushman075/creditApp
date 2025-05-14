
import { useAuthData } from "@/context/AuthContext";
import  { useEffect } from "react";


const OAuthCallback = () => {
  const { handleOAuthCallback } = useAuthData();

  useEffect(() => {
    handleOAuthCallback();
  }, [handleOAuthCallback]);

  return <div>Processing login...</div>;
};

export default OAuthCallback;
