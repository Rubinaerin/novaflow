import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard'; 

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/auth" />;
};

function App() {
  return (
    <Routes>
      {/* Giriş sayfası */}
      <Route path="/auth" element={<Auth />} />
      
      {/* Ana Panel - Sadece giriş yapanlar görebilir */}
      <Route 
        path="/" 
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } 
      />

      {/* Tanımsız her yolu ana sayfaya (veya login'e) yönlendir */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;