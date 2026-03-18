import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { validatePin } from '@/lib/pocketbase';

const brandCurve = [0.16, 1, 0.3, 1] as const;

interface PinEntryProps {
  onSuccess: () => void;
}

const PinEntry = ({ onSuccess }: PinEntryProps) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDigit = useCallback((digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError(false);

    if (newPin.length === 4) {
      setLoading(true);
      validatePin(newPin).then((valid) => {
        if (valid) {
          setTimeout(() => onSuccess(), 300);
        } else {
          setError(true);
          setPin('');
          setLoading(false);
        }
      });
    }
  }, [pin, onSuccess]);

  const handleBackspace = useCallback(() => {
    setPin((p) => p.slice(0, -1));
    setError(false);
  }, []);

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '←'];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: brandCurve }}
        className="flex flex-col items-center gap-8"
      >
        {/* Title */}
        <div className="text-center">
          <h1 className="text-sm tracking-[0.3em] text-muted-foreground mb-2">
            JUX_PRIVATE_CLOUD
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            {error ? 'ACCESS_DENIED' : 'ENTER_PIN'}
          </p>
        </div>

        {/* PIN Display */}
        <div className="flex gap-3">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={
                pin.length === i + 1
                  ? { scale: [0.95, 1] }
                  : error
                  ? { x: [0, -4, 4, -4, 4, 0] }
                  : {}
              }
              transition={{ duration: 0.2, ease: brandCurve }}
              className={`w-14 h-16 border flex items-center justify-center font-mono text-2xl tabular-nums transition-colors ${
                i < pin.length
                  ? 'border-primary text-primary'
                  : error
                  ? 'border-destructive'
                  : 'border-border'
              }`}
            >
              {i < pin.length ? '●' : ''}
            </motion.div>
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-1">
          {digits.map((d, i) => (
            <div key={i}>
              {d === '' ? (
                <div className="w-16 h-14" />
              ) : (
                <button
                  onClick={() => (d === '←' ? handleBackspace() : handleDigit(d))}
                  disabled={loading}
                  className="w-16 h-14 border border-border font-mono text-lg text-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-30"
                >
                  {d}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Loading indicator */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: brandCurve }}
              className="h-[1px] bg-primary w-full max-w-[200px]"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default PinEntry;
