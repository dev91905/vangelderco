import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import CulturalStrategy from "./pages/CulturalStrategy.tsx";
import CrossSector from "./pages/CrossSector.tsx";
import DeepOrganizing from "./pages/DeepOrganizing.tsx";
import NotFound from "./pages/NotFound.tsx";
import PostDetail from "./pages/PostDetail.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/cultural-strategy" element={<CulturalStrategy />} />
          <Route path="/cross-sector" element={<CrossSector />} />
          <Route path="/deep-organizing" element={<DeepOrganizing />} />
          <Route path="/post/:slug" element={<PostDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
