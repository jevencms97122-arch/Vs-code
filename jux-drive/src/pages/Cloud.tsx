import { useNavigate } from 'react-router-dom';
import Dashboard from '@/components/Dashboard';
import { ArrowLeft } from 'lucide-react';

const Cloud = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="h-10 border-b border-border flex items-center px-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          ACCUEIL
        </button>
      </div>
      <div className="flex-1">
        <Dashboard onLogout={() => {
          // No logout functionality needed since PIN auth is removed
        }} />
      </div>
    </div>
  );
};

export default Cloud;
