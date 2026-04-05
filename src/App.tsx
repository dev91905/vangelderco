import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import CulturalStrategy from "./pages/CulturalStrategy.tsx";
import CrossSector from "./pages/CrossSector.tsx";
import DeepOrganizing from "./pages/DeepOrganizing.tsx";
import NotFound from "./pages/NotFound.tsx";
import PostDetail from "./pages/PostDetail.tsx";
import Admin from "./pages/Admin.tsx";
import AdminEditor from "./pages/AdminEditor.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import RequireAuth from "./components/admin/RequireAuth.tsx";

const queryClient = new QueryClient();

function ConstellationRouter() {
  const location = useLocation();

  const getMode = (): ConstellationMode => {
    const path = location.pathname;
    if (path.startsWith("/cultural-strategy")) return "cultural-strategy";
    if (path.startsWith("/cross-sector")) return "cross-sector";
    if (path.startsWith("/deep-organizing")) return "deep-organizing";
    return "home";
  };

  return (
    <>
      <ConstellationField mode={getMode()} />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/cultural-strategy" element={<CulturalStrategy />} />
        <Route path="/cross-sector" element={<CrossSector />} />
        <Route path="/deep-organizing" element={<DeepOrganizing />} />
        <Route path="/post/:slug" element={<PostDetail />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<RequireAuth><Admin /></RequireAuth>} />
        <Route path="/admin/new" element={<RequireAuth><AdminEditor /></RequireAuth>} />
        <Route path="/admin/edit/:id" element={<RequireAuth><AdminEditor /></RequireAuth>} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ConstellationRouter />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
