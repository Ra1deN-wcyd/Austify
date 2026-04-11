import "bootstrap/dist/css/bootstrap.min.css";
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Resources from './pages/Resources';
import Collaborations from './pages/Collaboration'; // fixed the file path
import FindTeammates from './pages/FindTeammates';
import Chat from './pages/Chat';
import Problem from './pages/Problem';
import OAuthCallback from './pages/OAuthCallback';
import AdminDashboard from './pages/AdminDashboard';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Navbar />
                <Routes>
                    <Route path="/" element={<Welcome />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
                    <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                    <Route path="/resources" element={<PrivateRoute><Resources /></PrivateRoute>} />
                    <Route path="/collaborations" element={<PrivateRoute><FindTeammates /></PrivateRoute>} />
                    <Route path="/collaborations/manage" element={<PrivateRoute><Collaborations /></PrivateRoute>} />
                    <Route path="/collaborations/:id" element={<PrivateRoute><Collaborations /></PrivateRoute>} />
                    <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
                    <Route path="/problem" element={<PrivateRoute><Problem /></PrivateRoute>} />
                    <Route path="/admin/dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
                    <Route path="/auth/callback" element={<OAuthCallback />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
