import React, { useEffect, useState } from 'react';
import {
  Home,
  Users,
  CreditCard,
  ArrowRightLeft,
  PieChart,
  FileText,
  Landmark,
  Settings,
  LogOut,
  Menu,
  Bell,
  MessageSquare,
  User,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Briefcase,
  Calendar,
  DollarSign,
  BarChart3,
  Percent,
  Printer,
  Wallet,
  Share2,
  CircleDollarSign,
  ClipboardCheck,
  X,
  HelpCircle,
  Moon,
  Sun
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import AdminDashboard from './AdminDashboard';
import { useAuthData } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import { Link, replace, useNavigate } from 'react-router-dom';

export default function AdminNavbar() {
  const [collapsed, setCollapsed] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const {logout,userData} = useAuthData();

  // Sample notifications data
  const notifications = [
    {
      id: 1,
      title: "New loan application",
      description: "James Smith submitted a new loan application",
      time: "5 minutes ago",
      read: false
    },
    {
      id: 2,
      title: "Payment received",
      description: "Sara Williams made a payment of $500",
      time: "1 hour ago",
      read: false
    },
    {
      id: 3,
      title: "Loan approved",
      description: "Michael Johnson's loan was approved",
      time: "3 hours ago",
      read: true
    },
    {
      id: 4,
      title: "System update",
      description: "The system will undergo maintenance tonight at 10 PM",
      time: "Yesterday",
      read: true
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const mainNavItems = [
    { icon: Home, label: 'Dashboard', id: 'dashboard' },
    { icon: Users, label: 'Borrowers', id: 'borrowers' },
    { icon: CircleDollarSign, label: 'Loans', id: 'loans' },
    { icon: ArrowRightLeft, label: 'Repayments', id: 'repayments' },
    { icon: Wallet, label: 'Loan Parameters', id: 'loan-parameters' },
    { icon: ClipboardCheck, label: 'Accounting', id: 'accounting' },
    { icon: BarChart3, label: 'Reports', id: 'reports' },
    { icon: FileText, label: 'Collateral', id: 'collateral' },
    { icon: Settings, label: 'Access Configuration', id: 'access-configuration' },
    { icon: Landmark, label: 'Savings', id: 'savings' },
    { icon: DollarSign, label: 'Other Incomes', id: 'other-incomes' },
    { icon: Wallet, label: 'Payroll', id: 'payroll' },
    { icon: CreditCard, label: 'Expenses', id: 'expenses' },
    { icon: Share2, label: 'E-signature', id: 'e-signature' },
    { icon: Briefcase, label: 'Investor Accounts', id: 'investor-accounts' },
    { icon: Calendar, label: 'Calendar', id: 'calendar' }
  ];


  const [theme, setTheme] = useState('light');

  const navigate = useNavigate();
  
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

  const MobileNav = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <div className="h-full bg-emerald-600 dark:bg-emerald-900 text-white">
          <SidebarContent />
        </div>
      </SheetContent>
    </Sheet>
  );

  const SidebarContent = () => (
    <>
      
      <div className="px-3 py-2">
        <div className="bg-white/10 rounded-md p-2 mb-4 flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarFallback className="bg-emerald-200 text-emerald-800">{userData?.name?.slice(0,2)?.toLocaleUpperCase()||"JD"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-sm text-white">
            <p className="font-medium">{userData?.name||"John Doe"}</p>
            <p className="text-xs opacity-70">{userData.role}</p>
          </div>
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-150px)]">
        <div className="px-1 py-2">
          {mainNavItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={`w-full justify-start mb-1 text-white hover:text-white hover:bg-white/10 ${
                activePage === item.id ? "bg-white/20" : ""
              }`}
              onClick={() => setActivePage(item.id)}
            >
              <item.icon className="h-4 w-4 mr-3" />
              <span>{item.label}</span>
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start mb-1 text-white hover:text-white hover:bg-white/10"
          >
            <Settings className="h-4 w-4 mr-3" />
            <span>Settings</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={()=>{logout().then(()=>{toast.success("Logged out successfully");navigate("/login",{replace:true})}).catch(()=>{
              toast.error("Error logging out")
            })}}
            className="w-full justify-start mb-1 text-white hover:text-white hover:bg-white/10"
          >
            <LogOut className="h-4 w-4 mr-3" />
            <span>Sign Out</span>
          </Button>
        </div>
      </ScrollArea>
    </>
  );

  // Notification component
  const NotificationItem = ({ notification }) => (
    <div className={`p-3 border-b last:border-0 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
      !notification.read ? "bg-gray-50 dark:bg-gray-900" : ""
    }`}>
      <div className="flex justify-between items-start">
        <div className="font-medium text-sm">{notification.title}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{notification.time}</div>
      </div>
      <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">{notification.description}</div>
      {!notification.read && (
        <Badge variant="secondary" className="mt-2 text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">New</Badge>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Sidebar for desktop */}
      <div 
        className={`hidden md:block bg-emerald-600 dark:bg-emerald-900 h-full transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {collapsed ? (
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center h-14">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/10"
              onClick={() => setCollapsed(false)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <ScrollArea className="h-[calc(100vh-120px)] w-full">
              <div className="flex flex-col items-center gap-4 py-4">
                {mainNavItems.map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    size="icon"
                    className={`rounded-lg text-white hover:bg-white/10 ${
                      activePage === item.id ? "bg-white/20" : ""
                    }`}
                    onClick={() => setActivePage(item.id)}
                  >
                    <item.icon className="h-5 w-5" />
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-4 h-14">
              <Link to={'/'}>
              <div className="flex items-center text-white">
                <CreditCard className="h-6 w-6 mr-2 text-emerald-200" />
                <span className="font-bold text-lg">CREDIT APP</span>
              </div>
              </Link>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/10"
                onClick={() => setCollapsed(true)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            <SidebarContent />
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <MobileNav />
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{mainNavItems.find(item => item.id === activePage)?.label || 'Dashboard'}</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Theme Switcher */}
           <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            
            <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-0 -right-0 px-1.5 py-0.5 text-[10px] h-4 w-4 flex items-center justify-center"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800">
                  <h3 className="font-semibold">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <Badge variant="outline" className="rounded-full">
                        {unreadCount} new
                      </Badge>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <ScrollArea className="h-80">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <NotificationItem key={notification.id} notification={notification} />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-500 dark:text-gray-400">
                      <p>No notifications</p>
                    </div>
                  )}
                </ScrollArea>
                <div className="p-2 border-t border-gray-200 dark:border-gray-800">
                  <Button variant="outline" size="sm" className="w-full">
                    View all notifications
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button variant="ghost" size="icon">
              <MessageSquare className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-sm mr-1">Admin</span>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help & Support</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem  onClick={()=>{logout().then(()=>{toast.success("Logged out successfully");navigate("/login",{replace:true})}).catch(()=>{
              toast.error("Error logging out")
            })}}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="border border-gray-200 dark:border-gray-800">
              <CardContent className="flex items-center p-4">
                <div className="rounded-md bg-emerald-100 dark:bg-emerald-900/30 p-3 mr-4">
                  <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">200</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Active Users</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200 dark:border-gray-800">
              <CardContent className="flex items-center p-4">
                <div className="rounded-md bg-emerald-100 dark:bg-emerald-900/30 p-3 mr-4">
                  <User className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">100</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Borrowers</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200 dark:border-gray-800">
              <CardContent className="flex items-center p-4">
                <div className="rounded-md bg-emerald-100 dark:bg-emerald-900/30 p-3 mr-4">
                  <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">550,000</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Cash Disbursed</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200 dark:border-gray-800">
              <CardContent className="flex items-center p-4">
                <div className="rounded-md bg-emerald-100 dark:bg-emerald-900/30 p-3 mr-4">
                  <ArrowRightLeft className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">1,000,000</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Cash Received</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Placeholder for rest of dashboard */}
          <Card className="mb-4 border border-gray-200 dark:border-gray-800">
            <CardContent className="p-4">
             <AdminDashboard/>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}