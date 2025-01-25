import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const Profile = () => {
    const location = useLocation();
    const [user, setUser] = useState(location.state?.user || {});
    const [username, setUsername] = useState(user.username || '');
    const [email, setEmail] = useState(user.email || '');

    useEffect(() => {
        if (user.username) {
            setUsername(user.username);
            setEmail(user.email);
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const updatedUser = { ...user, username, email };
            const response = await axios.put(`/api/users/${user.id}`, updatedUser);
            if (response.status === 200) {
                setUser(response.data);
                alert('Profile updated successfully');
            }
        } catch (error) {
            console.error('Profile update failed', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Username:</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Email:</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <button type="submit">Update Profile</button>
        </form>
    );
};

export default Profile;