import React, { useEffect } from 'react';
import Login from '../components/Login/Login';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useSelector((state) => state.user);

    // Check authentication status when component mounts or when isAuthenticated changes
    useEffect(() => {
        if (isAuthenticated) {
            // Redirect to different pages based on user role
            if (user?.role === 'Admin') {
                // Navigate to Admin Dashboard if the user is an admin
                navigate('/admin/dashboard');
            } else {
                // Navigate to home page for regular users
                navigate('/');
            }
        }
    }, [isAuthenticated, user, navigate]); // Added user to dependencies

    return (
        <div>
            <Login />
        </div>
    );
};

export default LoginPage;
