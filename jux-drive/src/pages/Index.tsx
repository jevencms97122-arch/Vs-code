import { useState, useEffect } from 'react';
import { checkSession } from '@/lib/pocketbase';
import AuthEntry from '@/components/AuthEntry';
import HomePage from '@/components/HomePage';
import { AnimatePresence, motion } from 'framer-motion';
import { Wifi, WifiOff } from 'lucide-react';

const brandCurve = [0.16, 1, 0.3, 1] as const;

const Index = () => {
  const [authenticated, setAuthenticated] = useState(checkSession());
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'fast' | 'slow'>('checking');
  const [showIndicator, setShowIndicator] = useState(true);

  const pingServer = async () => {
    const startTime = Date.now();
    try {
      await fetch('http://188.115.125.74:8090/api/health', {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      const responseTime = Date.now() - startTime;
      setConnectionStatus(responseTime < 200 ? 'fast' : 'slow');
    } catch {
      const responseTime = Date.now() - startTime;
      setConnectionStatus(responseTime < 200 ? 'fast' : 'slow');
    }
    setTimeout(() => setShowIndicator(false), 5000);
  };

  useEffect(() => {
    pingServer();
  }, []);

  return (
    <AnimatePresence mode="wait">
      {authenticated ? (
        <motion.div
          key="home"
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.99 }}
          transition={{ duration: 0.3, ease: brandCurve }}
        >
          <AnimatePresence>
            {showIndicator && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{ duration: 0.3, ease: brandCurve }}
                className="fixed bottom-4 right-4 z-50"
              >
                <div className="bg-card border border-border rounded-sm p-2 flex items-center gap-1 shadow-lg min-w-[100px]">
                  {connectionStatus === 'fast' ? (
                    <Wifi className="w-4 h-4 text-primary" />
                  ) : connectionStatus === 'slow' ? (
                    <WifiOff className="w-4 h-4 text-destructive" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-muted-foreground border-t-primary rounded-full animate-spin" />
                  )}
                  <span className="text-xs font-mono text-foreground font-bold">
                    {connectionStatus === 'checking' 
                      ? 'VÉRIFICATION...' 
                      : connectionStatus === 'fast' 
                      ? 'RAPIDE' 
                      : 'LENT'}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <HomePage onLogout={() => setAuthenticated(false)} />
        </motion.div>
      ) : (
        <motion.div
          key="auth"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.99 }}
          transition={{ duration: 0.3, ease: brandCurve }}
        >
          <AuthEntry onSuccess={() => setAuthenticated(true)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Index;
