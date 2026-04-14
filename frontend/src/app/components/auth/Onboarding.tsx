import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card } from "../ui/card";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Input } from "../ui/input";
import { TrendingUp, ArrowRight } from "lucide-react";

interface OnboardingData {
  investedAmount: string;
  currentValue: string;
  riskLevel: string;
}

export function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<OnboardingData>({
    investedAmount: "",
    currentValue: "",
    riskLevel: ""
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
      id: "investedAmount",
      type: "input",
      title: "What is your total investment?",
      description: "Enter the total amount of money you have put in. We use this to track how much you started with.",
      placeholder: "e.g., 10000"
    },
    {
      id: "currentValue",
      type: "input",
      title: "What is it worth today?",
      description: "Enter what your investments are worth right now. This helps us calculate your overall progress.",
      placeholder: "e.g., 12500"
    },
    {
      id: "riskLevel",
      type: "radio",
      title: "How much risk are you comfortable with?",
      description: "We use this to personalize the insights we show you. Choose Low, Medium, or High based on your comfort level.",
      options: [
        { value: "low", label: "Low", description: "Prefer stable, safe investments" },
        { value: "medium", label: "Medium", description: "Balance between risk and stability" },
        { value: "high", label: "High", description: "Comfortable with high-risk for higher returns" }
      ]
    }
  ];

  const handleNext = () => {
    if (step < questions.length - 1) { // since array is 0-indexed, if on index 2 (length 3), it goes to complete
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
      tradingStyle: formData.riskLevel === 'high' ? 'day' : 
                    formData.riskLevel === 'medium' ? 'swing' : 'longterm'
    };

    // Save profile
    localStorage.setItem('investorProfile', JSON.stringify(profile));
    
    // Update user status
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      user.isNewUser = false;
      localStorage.setItem('user', JSON.stringify(user));
    }

    // Redirect to dashboard
    navigate('/dashboard');
  };

  const isCurrentInputValid = () => {
    const currentQ = questions[step];
    if (!currentQ) return false;
    const value = formData[currentQ.id as keyof OnboardingData];
    return value.trim() !== "";
  };

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
                To provide smarter insights and personalized recommendations, please answer a few quick questions about your investment.
              </p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Question {step + 1} of {questions.length}</span>
            <span>{Math.round(((step + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((step + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <Card className="p-8 bg-card border-border">
          {/* Question Steps */}
          {questions[step] && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold">{questions[step].title}</h3>
              <p className="text-muted-foreground">{questions[step].description}</p>
              
              {questions[step].type === "radio" ? (
                <RadioGroup
                  value={formData[questions[step].id as keyof OnboardingData]}
                  onValueChange={(value) => setFormData({ ...formData, [questions[step].id]: value })}
                >
                  <div className="space-y-3 mt-4">
                    {questions[step].options?.map((option) => (
                      <div
                        key={option.value}
                        className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                          formData[questions[step].id as keyof OnboardingData] === option.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setFormData({ ...formData, [questions[step].id]: option.value })}
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
              ) : (
                <div className="mt-4">
                  <Input 
                    type="number"
                    placeholder={questions[step].placeholder}
                    value={formData[questions[step].id as keyof OnboardingData]}
                    onChange={(e) => setFormData({...formData, [questions[step].id]: e.target.value})}
                    className="text-lg py-6"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                {step > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1"
                  >
                    Back
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  disabled={!isCurrentInputValid()}
                  className="flex-1 gap-2"
                >
                  {step === questions.length - 1 ? "Complete Setup" : "Next"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Skip Option */}
        <div className="text-center mt-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
