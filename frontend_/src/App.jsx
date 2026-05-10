import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ColorDashboard from './pages/ColorDashboard';

// Configuration React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ColorDashboard />
    </QueryClientProvider>
  );
}

export default App;
