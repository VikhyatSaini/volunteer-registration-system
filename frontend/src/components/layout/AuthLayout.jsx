import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

const AuthLayout = () => {
  const location = useLocation();

  return (
    // 1. Static Background (Does not animate)
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      
      {/* High-Quality Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center"
      >
        <div className="absolute inset-0 bg-slate-950/30"></div>
      </div>

      {/* 2. Animation Container with Perspective */}
      <div className="w-full max-w-5xl relative z-10" style={{ perspective: '2000px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ 
              duration: 0.6, 
              ease: [0.4, 0, 0.2, 1], // Smooth "page turn" easing
            }}
            style={{ 
              transformStyle: 'preserve-3d', 
              transformOrigin: 'center left' // Flips like a book page from the left spine
            }}
            className="w-full"
          >
            {/* Renders Login or Register component here */}
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuthLayout;