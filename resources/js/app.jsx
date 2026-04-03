import "bootstrap/dist/css/bootstrap.min.css";  // ← add this line
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
import Collaborations from './pages/Collaborations';
import Chat from './pages/Chat';

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
                    <Route path="/collaborations" element={<PrivateRoute><Collaborations /></PrivateRoute>} />
                    <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);