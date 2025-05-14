// src/App.tsx
import { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  ChevronRight, 
  CreditCard, 
  Lock, 
  Sparkles, 
  Clock,
  BadgeCheck, 
  Smartphone,
  Sun,
  Moon
} from 'lucide-react';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Link } from 'react-router-dom';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState('light');

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

  return (
    <div className="flex min-h-screen w-full flex-col mx-auto bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Navigation */}
      <header className="sticky top-0 mx-auto flex z-50 w-full border-b bg-white/95 dark:bg-gray-950/95 backdrop-blur">
        <div className="container w-full mx-auto  flex h-16 items-center justify-between px-4 md:px-6">
          <Link to={'/'}>
          <div className="flex justi items-center gap-2">
            <CreditCard className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xl font-bold">CreditApp</span>
          </div>
          </Link>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">How It Works</a>
            <a href="#testimonials" className="text-sm font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Testimonials</a>
            <Link to={'/login'}>
            <Button size="sm" variant="outline" className="mr-2">Sign In</Button>
           </Link>
           <Link to={'/signup'}>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600">Get Started</Button>
           </Link>
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </nav>
          
          {/* Mobile Navigation Toggle */}
          <div className="flex items-center gap-4 md:hidden">
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="container md:hidden py-4 space-y-3 px-4">
            <a href="#features" className="block text-sm font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Features</a>
            <a href="#how-it-works" className="block text-sm font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">How It Works</a>
            <a href="#testimonials" className="block text-sm font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Testimonials</a>
            <div className="flex gap-2 pt-2">
              <Link to={'/login'}>
              <Button size="sm" variant="outline" className="flex-1">Sign In</Button>
              </Link>
              <Link to="/signup">
              <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600">Get Started</Button>
            </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-col justify-center mx-auto">
        {/* Hero Section */}
          <BackgroundBeams className="z-0 opacity-100" />
        <section className="relative overflow-hidden py-16 md:py-24 lg:py-32">
          <div className="container relative z-10 max-w-5xl px-4 md:px-6">
            <div className="grid gap-8 md:grid-cols-2 md:gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40 px-3 py-1 text-sm text-emerald-700 dark:text-emerald-300">
                  <Sparkles className="mr-1 h-3.5 w-3.5" />
                  <span>Instant loan approval</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl/tight">
                  Quick Cash When <br className="hidden sm:inline" />
                  <span className="text-emerald-600 dark:text-emerald-400">You Need It Most</span>
                </h1>
                <p className="max-w-[600px] text-gray-600 dark:text-gray-400 md:text-xl">
                  Apply for a loan in minutes. Get approved in seconds. 
                  Receive funds directly in your account within hours.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to={'/signup'}>
                  <Button size="lg" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600">
                    Get Started
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  </Link>
                  <a href='#features'>
                  <Button size="lg" variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-950">
                    Learn More
                  </Button>
                  </a>
                </div>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/10 p-6 shadow-lg">
                <div className="space-y-4 rounded-lg bg-white dark:bg-gray-900 p-4 shadow-sm">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">How Much Do You Need?</h3>
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline" size="sm">$500</Button>
                      <Button variant="outline" size="sm">$1,000</Button>
                      <Button variant="secondary" size="sm" className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-800/30 dark:hover:bg-emerald-800/50 dark:text-emerald-200">$2,000</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Loan Term</span>
                      <span className="text-sm font-medium">3 months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Payment</span>
                      <span className="text-sm font-medium">$690</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Repayment</span>
                      <span className="text-sm font-medium">$2,070</span>
                    </div>
                  </div>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600">Apply Now</Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 bg-emerald-50 dark:bg-emerald-950/30">
          <div className="container max-w-5xl px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Why Choose CreditApp
              </h2>
              <p className="mx-auto mt-4 max-w-[700px] text-gray-600 dark:text-gray-400">
                We've simplified the loan process so you can focus on what matters most.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="border-emerald-100 dark:border-emerald-900">
                <CardHeader>
                  <Clock className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mb-2" />
                  <CardTitle>Fast Approval</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Get approved in minutes with our AI-powered decision engine.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-emerald-100 dark:border-emerald-900">
                <CardHeader>
                  <Smartphone className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mb-2" />
                  <CardTitle>100% Online</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Apply, approve, and manage your loan entirely from your smartphone.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-emerald-100 dark:border-emerald-900">
                <CardHeader>
                  <Lock className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mb-2" />
                  <CardTitle>Bank-Level Security</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your personal and financial information is always protected.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-emerald-100 dark:border-emerald-900">
                <CardHeader>
                  <BadgeCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mb-2" />
                  <CardTitle>No Hidden Fees</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Transparent terms with no surprise charges or prepayment penalties.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-emerald-100 dark:border-emerald-900">
                <CardHeader>
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mb-2" />
                  <CardTitle>Flexible Repayment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Choose repayment terms that fit your budget and schedule.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-emerald-100 dark:border-emerald-900">
                <CardHeader>
                  <CreditCard className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mb-2" />
                  <CardTitle>Direct Deposit</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Funds deposited directly to your bank account within hours.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16">
          <div className="container max-w-5xl px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                How It Works
              </h2>
              <p className="mx-auto mt-4 max-w-[700px] text-gray-600 dark:text-gray-400">
                Get the funds you need in three simple steps.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="relative">
                <div className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 dark:bg-emerald-500 text-sm font-medium text-white">
                  1
                </div>
                <Card className="h-full border-emerald-100 dark:border-emerald-900">
                  <CardHeader>
                    <CardTitle>Apply Online</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400">
                      Fill out our simple application form in less than 5 minutes. No paperwork needed.
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="relative">
                <div className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 dark:bg-emerald-500 text-sm font-medium text-white">
                  2
                </div>
                <Card className="h-full border-emerald-100 dark:border-emerald-900">
                  <CardHeader>
                    <CardTitle>Get Instant Approval</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400">
                      Our AI-powered system analyzes your application and provides an immediate decision.
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="relative">
                <div className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 dark:bg-emerald-500 text-sm font-medium text-white">
                  3
                </div>
                <Card className="h-full border-emerald-100 dark:border-emerald-900">
                  <CardHeader>
                    <CardTitle>Receive Funds</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400">
                      Funds are deposited directly to your bank account within hours of approval.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 bg-emerald-50 dark:bg-emerald-950/30">
          <div className="container max-w-5xl px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                What Our Customers Say
              </h2>
              <p className="mx-auto mt-4 max-w-[700px] text-gray-600 dark:text-gray-400">
                Join thousands of satisfied customers who got the financial help they needed.
              </p>
            </div>
            <Carousel className="w-full max-w-md mx-auto">
              <CarouselContent>
                <CarouselItem>
                  <div className="p-1">
                    <Card className="border-emerald-100 dark:border-emerald-900">
                      <CardContent className="p-6">
                        <div className="flex flex-col space-y-4">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className="h-5 w-5 fill-current text-yellow-500"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                              </svg>
                            ))}
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 italic">
                            "I needed cash for an emergency car repair. CreditApp came through when I needed it most. The application took minutes, and the money was in my account the same day!"
                          </p>
                          <div className="flex items-center space-x-2">
                            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">JM</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">James Miller</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">San Diego, CA</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
                <CarouselItem>
                  <div className="p-1">
                    <Card className="border-emerald-100 dark:border-emerald-900">
                      <CardContent className="p-6">
                        <div className="flex flex-col space-y-4">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className="h-5 w-5 fill-current text-yellow-500"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                              </svg>
                            ))}
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 italic">
                            "As a small business owner, I've used CreditApp multiple times for cash flow gaps. Their rates are fair and the process couldn't be easier."
                          </p>
                          <div className="flex items-center space-x-2">
                            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">SW</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Sarah Wilson</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Chicago, IL</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
                <CarouselItem>
                  <div className="p-1">
                    <Card className="border-emerald-100 dark:border-emerald-900">
                      <CardContent className="p-6">
                        <div className="flex flex-col space-y-4">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className="h-5 w-5 fill-current text-yellow-500"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                              </svg>
                            ))}
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 italic">
                            "After being rejected by my bank, CreditApp approved my loan application in minutes. The customer service team was incredibly helpful throughout the process."
                          </p>
                          <div className="flex items-center space-x-2">
                            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">DT</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">David Thompson</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Atlanta, GA</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious className="left-0" />
              <CarouselNext className="right-0" />
            </Carousel>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container max-w-5xl px-4 md:px-6">
            <div className="rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 dark:from-emerald-500 dark:to-emerald-700 p-8 shadow-lg text-white">
              <div className="grid gap-6 md:grid-cols-2 md:gap-12 items-center">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold">Ready to get started?</h2>
                  <p className="max-w-[500px]">
                    Apply now and get the funds you need in as little as 2 hours. No hidden fees, no paperwork.
                  </p>
                </div>
                <div className="flex items-center justify-center md:justify-end">
                  <Button size="lg" variant="secondary" className="w-full md:w-auto bg-white text-emerald-700 hover:bg-gray-100 dark:bg-gray-900 dark:text-emerald-400 dark:hover:bg-gray-800">
                    Apply for a Loan
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t max-w-full mx-auto border-gray-200 dark:border-gray-800 py-12">
        <div className="container px-4 w-full md:px-6">
          <div className="grid justify-between md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xl font-bold">CreditApp</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Fast, secure, and transparent instant loans for everyone.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-medium">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors">
                    Personal Loans
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors">
                    Business Loans
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors">
                    Loan Calculator
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors">
                    Interest Rates
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-medium">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors">
                    Press
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-medium">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    GDPR
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
            <p>© 2025 CreditApp. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}