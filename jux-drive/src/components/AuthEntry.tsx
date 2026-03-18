import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loginWithEmail } from '@/lib/pocketbase';
import { Mail, Lock, ArrowLeft, Loader2 } from 'lucide-react';

const brandCurve = [0.16, 1, 0.3, 1] as const;

interface AuthEntryProps {
  onSuccess: () => void;
}

const AuthEntry = ({ onSuccess }: AuthEntryProps) => {
  const [mode, setMode] = useState<'select' | 'email'>('select');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = useCallback(async () => {
    if (!email || !password) return;
    setLoading(true);
    setError(false);
    
    const success = await loginWithEmail(email, password);
    if (success) {
      setTimeout(() => onSuccess(), 300);
    } else {
      setError(true);
      setLoading(false);
    }
  }, [email, password, onSuccess]);

  const renderSelectMode = () => (
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
          CHOISISSEZ_VOTRE_MÉTHODE
        </p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <button
          onClick={() => setMode('email')}
          className="group flex items-center gap-4 p-4 border border-border hover:border-primary hover:bg-primary/5 transition-all rounded-sm"
        >
          <div className="p-2 bg-primary/10 rounded-sm">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-mono font-medium text-foreground">Connexion Email</p>
            <p className="text-xs text-muted-foreground">Adresse email et mot de passe</p>
          </div>
          <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>
      </div>
    </motion.div>
  );

  const renderEmailMode = () => (
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
          {error ? 'ACCÈS_REFUSÉ' : 'CONNEXION_EMAIL'}
        </p>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <div>
          <label className="block text-xs font-mono text-muted-foreground mb-2">
            ADRESSE_EMAIL
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="flex-1 bg-secondary border border-border px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
            <Mail className="w-8 h-8 text-muted-foreground self-end mb-2" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-muted-foreground mb-2">
            MOT_DE_PASSE
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="flex-1 bg-secondary border border-border px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
            <Lock className="w-8 h-8 text-muted-foreground self-end mb-2" />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setMode('select')}
            className="flex-1 px-4 py-2 text-xs font-mono border border-border hover:bg-secondary transition-colors"
          >
            RETOUR
          </button>
          <button
            onClick={handleEmailLogin}
            disabled={loading || !email || !password}
            className="flex-1 px-4 py-2 text-xs font-mono bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'CONNEXION...' : 'SE_CONNECTER'}
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      {mode === 'select' && renderSelectMode()}
      {mode === 'email' && renderEmailMode()}
    </div>
  );
};

export default AuthEntry;