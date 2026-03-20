import { useNavigate, useLocation } from 'react-router-dom';
import Dashboard from '@/components/Dashboard';
import { ArrowLeft } from 'lucide-react';

const Cloud = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialFolderId = (location.state as { folderId?: string })?.folderId;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="h-12 sm:h-10 border-b border-border flex items-center px-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 sm:gap-2 text-sm sm:text-xs font-mono text-muted-foreground hover:text-foreground transition-colors p-2 -m-2 rounded hover:bg-accent/50"
        >
          <ArrowLeft className="w-5 h-5 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
          ACCUEIL
        </button>
      </div>
      <div className="flex-1">
        <Dashboard
          initialFolderId={initialFolderId}
          onLogout={() => {}}
        />
      </div>
    </div>
  );
};

export default Cloud;
