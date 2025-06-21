
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import BatchesPage from "./pages/BatchesPage";
import BatchDetailPage from "./pages/BatchDetailPage";
import LiveClassesPage from "./pages/LiveClassesPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import KeyGenerationPage from "./pages/KeyGenerationPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/key-generation" element={<KeyGenerationPage />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/batches" element={
                <ProtectedRoute>
                  <BatchesPage />
                </ProtectedRoute>
              } />
              <Route path="/batch/:batchId" element={
                <ProtectedRoute>
                  <BatchDetailPage />
                </ProtectedRoute>
              } />
              <Route path="/live-classes" element={
                <ProtectedRoute>
                  <LiveClassesPage />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
