import { useState } from 'react';
import { checkSession } from '@/lib/pocketbase';
import PinEntry from '@/components/PinEntry';
import Dashboard from '@/components/Dashboard';
import { AnimatePresence, motion } from 'framer-motion';

const brandCurve = [0.16, 1, 0.3, 1] as const;

const Index = () => {
  const [authenticated, setAuthenticated] = useState(checkSession());

  return (
    <AnimatePresence mode="wait">
      {authenticated ? (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.99 }}
          transition={{ duration: 0.3, ease: brandCurve }}
        >
          <Dashboard onLogout={() => setAuthenticated(false)} />
        </motion.div>
      ) : (
        <motion.div
          key="pin"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.99 }}
          transition={{ duration: 0.3, ease: brandCurve }}
        >
          <PinEntry onSuccess={() => setAuthenticated(true)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Index;
