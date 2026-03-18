import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Editor from "./pages/Editor.tsx";
import NotFound from "./pages/NotFound.tsx";
import { lazy, Suspense } from "react";

const CloudPage = lazy(() => import("./pages/Cloud.tsx"));
const FavoritesPage = lazy(() => import("./pages/Favorites.tsx"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/cloud" element={
            <Suspense fallback={<div className="min-h-screen bg-background" />}>
              <CloudPage />
            </Suspense>
          } />
          <Route path="/favorites" element={
            <Suspense fallback={<div className="min-h-screen bg-background" />}>
              <FavoritesPage />
            </Suspense>
          } />
          <Route path="/editor" element={<Editor />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
