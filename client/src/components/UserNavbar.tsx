import React, { useState, useEffect } from 'react';
import { 
  Home, 
  CreditCard, 
  Wallet, 
  LayoutGrid,
  Bell,
  Settings,
  User,
  ChevronDown,
  LogOut,
  HelpCircle,
  Menu,
  Moon,
  Sun,
  X
} from 'lucide-react';

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import UserHomeTab from './UserHomeTab';
import { toast } from 'react-toastify';
import { useAuthData } from '@/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function UserNavbar() {
  const [activeTab, setActiveTab] = useState('home');
  const [theme, setTheme] = useState('light');
    const navigate = useNavigate();
    const {logout} = useAuthData();
  
  // Theme toggle handler
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', newTheme);
  };

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    setTheme(savedTheme);
    
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const navItems = [
    { 
      icon: Home, 
      label: 'Home', 
      key: 'home' 
    },
    { 
      icon: CreditCard, 
      label: 'Payments', 
      key: 'payments' 
    },
    { 
      icon: Wallet, 
      label: 'Budget', 
      key: 'budget' 
    },
    { 
      icon: LayoutGrid, 
      label: 'Card', 
      key: 'card' 
    }
  ];

  // Mobile Navigation Menu Content
  const MobileNavContent = () => (
<div>
    <div className="flex top-0 z-10 left-0 fixed flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <Link to={'/'}>
        <div className="flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xl font-bold text-gray-800 dark:text-gray-200">CREDIT APP</span>
        </div>
        </Link>
        <SheetClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </SheetClose>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 flex flex-col gap-2">
          {navItems.map((item) => (
            <Button
              key={item.key}
              variant={activeTab === item.key ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                setActiveTab(item.key);
              }}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          ))}
          <div className="h-px bg-gray-200 dark:bg-gray-800 my-2" />
          <Button
            variant="ghost"
            className="w-full justify-start"
          >
            <User className="mr-2 h-4 w-4" />
            Profile
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            Help & Support
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </ScrollArea>
    </div>
    <div className='fixed flex flex-col top-0 left-0 z-0'>
      {activeTab=='Home'&&<UserHomeTab/>}

    </div>
    </div>
  );

  return (
    <>
    <nav className="sticky top-0 z-50 w-full bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo and Mobile Menu */}
          <div className="flex items-center">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2 md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                <MobileNavContent />
              </SheetContent>
            </Sheet>
            
            {/* Logo */}
            <div className="flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xl font-bold text-gray-800 dark:text-gray-200">CREDIT APP</span>
            </div>
          </div>

          {/* Navigation Tabs - Hidden on Mobile */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
            {navItems.map((item) => (
              <Button
                key={item.key}
                variant={activeTab === item.key ? 'secondary' : 'ghost'}
                onClick={() => setActiveTab(item.key)}
                className="flex items-center gap-2"
                size="sm"
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden lg:inline-block text-sm font-medium">{item.label}</span>
              </Button>
            ))}
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-1 lg:space-x-2">
            {/* Theme Toggle */}
            <Button 
              onClick={toggleTheme} 
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
            
            {/* Notifications Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-0 -right-0 px-1.5 py-0.5 text-xs h-4 w-4 flex items-center justify-center"
                  >
                    3
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  New payment received
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Budget alert
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Account update
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Settings Dropdown - Hidden on Small Mobile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden sm:flex">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help & Support
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Preferences
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="h-7 w-7 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <ChevronDown className="h-4 w-4 hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={()=>{logout().then(()=>{toast.success("Logged out successfully");navigate("/login",{replace:true})}).catch(()=>{
                              toast.error("Error logging out")
                            })}}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
    <div>
      {activeTab=='home'&&<UserHomeTab/>}
    </div>
    </>
  );
}