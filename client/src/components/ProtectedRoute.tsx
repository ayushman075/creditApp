import { useAuthData } from "@/context/AuthContext";
import { useSignIn } from "@clerk/clerk-react";
import type { ReactNode, ReactElement } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  element: ReactNode;
  redirectPath?: string;
}

const ProtectedRoute = ({ 
  element, 
  redirectPath = "/login" 
}: ProtectedRouteProps): ReactElement => {
  const { isSignedIn } = useAuthData();
  const {isLoaded} = useSignIn()
  // If user is signed in, render the protected element
  // Otherwise, redirect to login page (or other specified path)
  return isLoaded?isSignedIn ? (
    <>{element}</>
  ) : (
    <Navigate to={redirectPath} replace />
  ):     <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar skeleton */}
      <div className="hidden md:block bg-gray-200 dark:bg-gray-800 w-64 h-full animate-pulse">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
        </div>
        <div className="px-3 py-2">
          <div className="bg-gray-300 dark:bg-gray-700 rounded-md p-4 mb-4 flex items-center">
            <div className="h-8 w-8 rounded-full bg-gray-400 dark:bg-gray-600 mr-2"></div>
            <div className="flex-1">
              <div className="h-3 bg-gray-400 dark:bg-gray-600 rounded w-20 mb-2"></div>
              <div className="h-2 bg-gray-400 dark:bg-gray-600 rounded w-16"></div>
            </div>
          </div>
        </div>
        <div className="px-3 py-2">
          {/* Sidebar menu items */}
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="h-8 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar skeleton */}
        <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full md:hidden"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full mr-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          </div>
        </header>

        {/* Dashboard content skeleton */}
        <main className="flex-1 overflow-auto p-4">
          {/* Stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900">
                <div className="flex items-center p-4">
                  <div className="rounded-md bg-gray-200 dark:bg-gray-700 p-3 mr-4 h-10 w-10"></div>
                  <div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main content card */}
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 mb-4">
            <div className="p-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
              </div>
            </div>
          </div>
          
          {/* Additional content blocks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 p-4">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
            <div className="border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 p-4">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
          </div>
        </main>
      </div>
    </div>;
};

export default ProtectedRoute;