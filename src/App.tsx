import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import ConstellationField from "./components/ConstellationField";
import type { ConstellationMode } from "./components/ConstellationField";
import DarkModeToggle from "./components/DarkModeToggle";
import CRTOverlay from "./components/CRTOverlay";
import Index from "./pages/Index.tsx";
import CulturalStrategy from "./pages/CulturalStrategy.tsx";
import CrossSector from "./pages/CrossSector.tsx";
import DeepOrganizing from "./pages/DeepOrganizing.tsx";
import Deck from "./pages/Deck.tsx";
import NotFound from "./pages/NotFound.tsx";
import PostDetail from "./pages/PostDetail.tsx";
import Admin from "./pages/Admin.tsx";
import AdminEditor from "./pages/AdminEditor.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import RequireAuth from "./components/admin/RequireAuth.tsx";
import AdminSubmissions from "./pages/AdminSubmissions.tsx";
import Work from "./pages/Work.tsx";

const queryClient = new QueryClient();

const ROUTE_MODE_MAP: Record<string, ConstellationMode> = {
  "/": "home",
  "/cultural-strategy": "cultural-strategy",
  "/cross-sector": "cross-sector",
  "/deep-organizing": "deep-organizing",
};

function AppRoutes() {
  const location = useLocation();
  const mode = ROUTE_MODE_MAP[location.pathname] || "home";
  const hideConstellation = true;
  const hideDarkToggle = location.pathname === "/diagnostic" || location.pathname === "/work";

  return (
    <>
      {!hideConstellation && <ConstellationField mode={mode} />}
      <CRTOverlay />
      {!hideDarkToggle && <DarkModeToggle />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/cultural-strategy" element={<CulturalStrategy />} />
        <Route path="/cross-sector" element={<CrossSector />} />
        <Route path="/deep-organizing" element={<DeepOrganizing />} />
        <Route path="/post/:slug" element={<PostDetail />} />
        <Route path="/work" element={<Work />} />
        <Route path="/diagnostic" element={<Deck />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<RequireAuth><Admin /></RequireAuth>} />
        <Route path="/admin/new" element={<RequireAuth><AdminEditor /></RequireAuth>} />
        <Route path="/admin/edit/:id" element={<RequireAuth><AdminEditor /></RequireAuth>} />
        <Route path="/admin/submissions" element={<RequireAuth><AdminSubmissions /></RequireAuth>} />
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
      <DarkModeProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </DarkModeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
