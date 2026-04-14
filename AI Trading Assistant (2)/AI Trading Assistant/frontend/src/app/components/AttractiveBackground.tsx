interface AttractiveBackgroundProps {
  variant?: 'home' | 'signup' | 'login' | 'dashboard';
}

export function AttractiveBackground({ variant = 'home' }: AttractiveBackgroundProps) {
  let bgImage = '';
  
  switch(variant) {
    case 'home':
      bgImage = 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=2070&auto=format&fit=crop'; // Cinematic Neon Chart
      break;
    case 'login':
      bgImage = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop'; // Candlestick Graph
      break;
    case 'signup':
      bgImage = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop'; // Abstract Data Network
      break;
    case 'dashboard':
      bgImage = '/dashboard_bg.png'; // High quality 3d generated neon trading globe
      break;
  }

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-background pointer-events-none">
      {bgImage && (
        <img 
          src={bgImage} 
          className={`w-full h-full object-cover scale-[1.3] transform transition-all duration-700 
            ${variant === 'dashboard' ? 'opacity-[0.15] dark:opacity-30 mix-blend-plus-lighter' : 'opacity-40 dark:opacity-20 invert dark:invert-0 mix-blend-multiply dark:mix-blend-luminosity'} 
          `}
          alt="Trading Background"
        />
      )}
      
      {/* Blend Gradients to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/80 to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
    </div>
  );
}
