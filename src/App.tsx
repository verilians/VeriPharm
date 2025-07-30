import { BrowserRouter } from 'react-router-dom';
import { useEffect } from 'react';
import AppRoutes from './routes';
import { useAuthStore } from './stores/authStore';

function App() {
  const { initializeAuth, isInitialized, isLoading } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Show loading spinner while auth is being initialized
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}

export default App;