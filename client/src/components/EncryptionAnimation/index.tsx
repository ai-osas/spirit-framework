import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Shield } from 'lucide-react';
import React from 'react';

interface EncryptionAnimationProps {
  isEncrypting: boolean;
  onComplete?: () => void;
}

export const EncryptionAnimation: React.FC<EncryptionAnimationProps> = ({
  isEncrypting,
  onComplete
}) => {
  React.useEffect(() => {
    if (isEncrypting) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 2000); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [isEncrypting, onComplete]);

  return (
    <AnimatePresence>
      {isEncrypting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl p-8 max-w-sm w-full mx-4 shadow-2xl"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="mx-auto mb-4 relative"
              >
                <Shield className="w-12 h-12 text-yellow-500" />
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Lock className="w-6 h-6 text-yellow-600" />
                </motion.div>
              </motion.div>

              <h3 className="text-lg font-semibold mb-2">Encrypting Entry</h3>
              <p className="text-sm text-gray-600 mb-4">
                Securing your thoughts with end-to-end encryption
              </p>

              {/* Animated "code" blocks */}
              <div className="space-y-2 mb-4">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.2 }}
                    className="h-2 bg-gray-200 rounded-full overflow-hidden"
                  >
                    <motion.div
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        delay: i * 0.2
                      }}
                      className="h-full w-1/2 bg-gradient-to-r from-yellow-500/20 to-yellow-500/40"
                    />
                  </motion.div>
                ))}
              </div>

              <div className="text-xs text-gray-500">
                Your data is being encrypted
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
