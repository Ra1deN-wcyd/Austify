import { useContext } from 'react';
import { AuthContext } from '../context/authcontext';

export const useAuth = () => useContext(AuthContext);