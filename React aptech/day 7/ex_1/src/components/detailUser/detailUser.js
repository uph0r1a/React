import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function detailUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState({})

  useEffect(() => {
    axios
      .get(`https://jsonplaceholder.typicode.com/users/${id}`)
      .then((res) => setUser(res.data))
  }, [id])
  return (
    <div>
      <ul>
        <li>{user.id}</li>
        <li>{user.name}</li>
        <li>{user.username}</li>
        <li>{user.email}</li>
        <li>
          Address: {user.address?.street}, {user.address?.suite},{" "}
          {user.address?.city}, {user.address?.zipcode}
        </li>

      </ul>
    </div>
  )
}

export default detailUser