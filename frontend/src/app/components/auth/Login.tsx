import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Eye, EyeOff, TrendingUp } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              TradeMind AI
            </h1>
          </div>
          <p className="text-muted-foreground">Welcome back! Please log in to continue</p>
        </div>

        <Card className="p-8 bg-card border-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className={`mt-1 ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-1">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={errors.password ? 'border-red-500' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full mt-6">
              Log In
            </Button>
          </form>

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
