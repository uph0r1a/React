import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';

function User() {
    const navigate = useNavigate();
    const [user, setUser] = useState([]);

    const getUsers = async () => {
        try {
            const res = await axios.get("https://jsonplaceholder.typicode.com/users")
            setUser(res.data)
            console.log(res.data);

        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getUsers();
    }, [])
    return (
        <div>
            <h2>User</h2>
            <table>
                <thead>
                    <tr key={user.id}>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Website</th>
                    </tr>
                </thead>
                <tbody>
                    {user.map((user) => (
                        <tr>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.phone}</td>
                            <td><button onClick={() => navigate(`/detailUser/${user.id}`)}>View</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default User