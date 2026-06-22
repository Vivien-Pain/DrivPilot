import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Team } from './pages/Team';
import { Planning } from './pages/Planning';
import { Fleet } from './pages/Fleet';
import { Pedagogy } from './pages/Pedagogy';
import { Wallet } from './pages/Wallet';
import { Chat } from './pages/Chat';
import { useAuth } from './store/useAuth';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const token = useAuth((state) => state.token);
    return token ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
                <Route path="/planning" element={<ProtectedRoute><Planning /></ProtectedRoute>} />
                <Route path="/fleet" element={<ProtectedRoute><Fleet /></ProtectedRoute>} />
                <Route path="/pedagogy" element={<ProtectedRoute><Pedagogy /></ProtectedRoute>} />
                <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;