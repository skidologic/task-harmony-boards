
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import Index from "./pages/Index";
import TaskView from "./pages/TaskView";
import TaskCreateView from "./pages/TaskCreateView";
import TaskEditView from "./pages/TaskEditView";
import CalendarView from "./pages/CalendarView";
import NotFound from "./pages/NotFound";

// Initialize QueryClient
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/tasks" element={<Index />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/tasks/new" element={<TaskCreateView />} />
            <Route path="/tasks/:taskId" element={<TaskView />} />
            <Route path="/tasks/:taskId/edit" element={<TaskEditView />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;