import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Eye, EyeOff, TrendingUp } from "lucide-react";
import { AttractiveBackground } from "../AttractiveBackground";
import { ThemeToggle } from "../ThemeToggle";

export function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // In a real app, this would be an API call to authenticate
      // For demo purposes, we'll simulate a successful login
      
      // Check if there's an existing user profile from previous signup
      const existingUser = localStorage.getItem('user');
      const profile = localStorage.getItem('investorProfile');
      
      if (existingUser && profile) {
        // User has completed signup and onboarding before
        const userData = JSON.parse(existingUser);
        userData.isNewUser = false;
        localStorage.setItem('user', JSON.stringify(userData));
        navigate('/dashboard');
      } else if (existingUser && !profile) {
        // User signed up but didn't complete onboarding
        navigate('/onboarding');
      } else {
        // No existing user - create a demo user session
        // In real app, this would come from API response
        localStorage.setItem('user', JSON.stringify({
          fullName: "Demo User",
          email: formData.email,
          phone: "",
          isNewUser: false
        }));
        
        // Create a demo profile so they can access dashboard
        localStorage.setItem('investorProfile', JSON.stringify({
          experience: "intermediate",
          riskTolerance: "moderate",
          investmentGoal: "growth",
          monthlyInvestment: "1000-2500",
          timeHorizon: "medium",
          tradingStyle: "swing",
          createdAt: new Date().toISOString()
        }));
        
        navigate('/dashboard');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ""
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent text-foreground p-4 relative overflow-hidden transition-colors">
      <AttractiveBackground variant="login" />

      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-lg lg:max-w-xl relative z-10 mt-10">
        {/* Logo/Brand */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-5 mb-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.5)]">
              <TrendingUp className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-6xl font-black bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent drop-shadow-sm tracking-tight text-foreground">
              TradeAI
            </h1>
          </div>
          <p className="text-muted-foreground text-xl font-medium">Welcome back! Please log in to continue</p>
        </div>

        <Card className="p-10 bg-card/90 backdrop-blur-xl border-border/50 shadow-[0_0_50px_rgba(0,0,0,0.3)] premium-card rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-base font-bold text-foreground mb-2 block tracking-wide">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className={`h-14 text-lg rounded-xl bg-background/50 ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && (
                <p className="text-sm font-bold text-red-500 mt-2">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="password" className="text-base font-bold text-foreground tracking-wide">Password</Label>
                <Link 
                  to="/forgot-password" 
                  className="text-base font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`h-14 text-lg rounded-xl bg-background/50 ${errors.password ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm font-bold text-red-500 mt-2">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full mt-8 h-16 text-xl font-black rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
              Log In
            </Button>
          </form>

          {/* Signup Link */}
          <div className="mt-8 text-center bg-background/30 p-4 rounded-2xl">
            <p className="text-base font-medium text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:text-primary/80 font-black tracking-wide ml-1">
                SIGN UP
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
