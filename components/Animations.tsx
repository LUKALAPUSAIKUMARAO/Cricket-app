import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

export function BoundaryAnimation({ 
  type, 
  onComplete 
}: { 
  type: '4' | '6' | null; 
  onComplete: () => void; 
}) {
  useEffect(() => {
    if (type) {
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [type, onComplete]);

  return (
    <AnimatePresence>
      {type && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none bg-black/60 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0, y: 100, rotate: -45 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 1.5, opacity: 0, filter: 'blur(10px)' }}
            transition={{ type: 'spring', damping: 12, stiffness: 100 }}
            className="relative"
          >
            <motion.div
              animate={{ 
                rotate: [0, -5, 5, -5, 5, 0],
                scale: [1, 1.1, 1.1, 1.1, 1.1, 1]
              }}
              transition={{ duration: 1, delay: 0.3 }}
              className={`text-[8rem] sm:text-[12rem] font-black italic tracking-tighter uppercase ${
                type === '4' 
                  ? 'text-blue-500 drop-shadow-[0_0_40px_rgba(59,130,246,0.8)]' 
                  : 'text-purple-500 drop-shadow-[0_0_40px_rgba(168,85,247,0.8)]'
              }`}
              style={{
                WebkitTextStroke: '4px white',
              }}
            >
              {type === '4' ? 'FOUR' : 'SIX'}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
