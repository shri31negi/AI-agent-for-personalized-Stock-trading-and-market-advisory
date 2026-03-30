import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card } from "../ui/card";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { TrendingUp, ArrowRight } from "lucide-react";

interface OnboardingData {
  experience: string;
  riskTolerance: string;
  investmentGoal: string;
  monthlyInvestment: string;
  timeHorizon: string;
}

export function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<OnboardingData>({
    experience: "",
    riskTolerance: "",
    investmentGoal: "",
    monthlyInvestment: "",
    timeHorizon: ""
  });

  // Check if user is authenticated
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/signup');
    }
  }, [navigate]);

  const questions = [
    {
      id: "experience",
      title: "What's your investment experience level?",
      options: [
        { value: "beginner", label: "Beginner", description: "New to investing" },
        { value: "intermediate", label: "Intermediate", description: "1-3 years experience" },
        { value: "advanced", label: "Advanced", description: "3-5 years experience" },
        { value: "expert", label: "Expert", description: "5+ years experience" }
      ]
    },
    {
      id: "riskTolerance",
      title: "What's your risk tolerance?",
      options: [
        { value: "conservative", label: "Conservative", description: "Prefer stable, low-risk investments" },
        { value: "moderate", label: "Moderate", description: "Balance between risk and stability" },
        { value: "aggressive", label: "Aggressive", description: "Comfortable with high-risk for higher returns" }
      ]
    },
    {
      id: "investmentGoal",
      title: "What's your primary investment goal?",
      options: [
        { value: "income", label: "Income Generation", description: "Regular dividends and returns" },
        { value: "growth", label: "Capital Growth", description: "Long-term wealth building" },
        { value: "balanced", label: "Balanced", description: "Mix of income and growth" },
        { value: "preservation", label: "Capital Preservation", description: "Protect existing wealth" }
      ]
    }
  ];

  const handleNext = () => {
    if (step < questions.length) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    // Create investor profile
    const profile = {
      ...formData,
      createdAt: new Date().toISOString(),
      tradingStyle: formData.riskTolerance === 'aggressive' ? 'day' : 
                    formData.riskTolerance === 'moderate' ? 'swing' : 'longterm'
    };

    // Save profile
    localStorage.setItem('investorProfile', JSON.stringify(profile));
    
    // Update user status
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    user.isNewUser = false;
    localStorage.setItem('user', JSON.stringify(user));

    // Redirect to dashboard
    navigate('/dashboard');
  };

  const currentQuestion = questions[step];
  const isLastStep = step === questions.length;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              TradeMind AI
            </h1>
          </div>
          
          {step === 0 && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Welcome! Let's personalize your experience</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                To provide smarter insights and personalized recommendations, please answer a few quick questions about your investment preferences. This will take less than one minute.
              </p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {step > 0 && (
          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Question {step} of {questions.length + 1}</span>
              <span>{Math.round((step / (questions.length + 1)) * 100)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(step / (questions.length + 1)) * 100}%` }}
              />
            </div>
          </div>
        )}

        <Card className="p-8 bg-card border-border">
          {step === 0 ? (
            // Welcome Screen
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Ready to get started?</h3>
              <p className="text-muted-foreground mb-8">
                We'll ask you {questions.length + 1} quick questions to understand your investment profile
              </p>
              <Button onClick={handleNext} size="lg" className="gap-2">
                Let's Begin
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          ) : !isLastStep ? (
            // Question Steps
            <div className="space-y-6">
              <h3 className="text-xl font-bold">{currentQuestion.title}</h3>
              
              <RadioGroup
                value={formData[currentQuestion.id as keyof OnboardingData]}
                onValueChange={(value) => setFormData({ ...formData, [currentQuestion.id]: value })}
              >
                <div className="space-y-3">
                  {currentQuestion.options.map((option) => (
                    <div
                      key={option.value}
                      className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                        formData[currentQuestion.id as keyof OnboardingData] === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setFormData({ ...formData, [currentQuestion.id]: option.value })}
                    >
                      <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                      <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                        <p className="font-semibold text-foreground">{option.label}</p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!formData[currentQuestion.id as keyof OnboardingData]}
                  className="flex-1 gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            // Final Step - Additional Info
            <div className="space-y-6">
              <h3 className="text-xl font-bold">Almost done! Just two more questions</h3>
              
              <div>
                <Label htmlFor="monthlyInvestment" className="mb-2 block">
                  What's your expected monthly investment range?
                </Label>
                <Select
                  value={formData.monthlyInvestment}
                  onValueChange={(value) => setFormData({ ...formData, monthlyInvestment: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-500">$0 - $500</SelectItem>
                    <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                    <SelectItem value="1000-2500">$1,000 - $2,500</SelectItem>
                    <SelectItem value="2500-5000">$2,500 - $5,000</SelectItem>
                    <SelectItem value="5000+">$5,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="timeHorizon" className="mb-2 block">
                  What's your investment time horizon?
                </Label>
                <Select
                  value={formData.timeHorizon}
                  onValueChange={(value) => setFormData({ ...formData, timeHorizon: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time horizon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short-term (0-2 years)</SelectItem>
                    <SelectItem value="medium">Medium-term (2-5 years)</SelectItem>
                    <SelectItem value="long">Long-term (5-10 years)</SelectItem>
                    <SelectItem value="verylong">Very Long-term (10+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={!formData.monthlyInvestment || !formData.timeHorizon}
                  className="flex-1 gap-2"
                >
                  Complete Setup
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Skip Option */}
        {step > 0 && (
          <div className="text-center mt-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
