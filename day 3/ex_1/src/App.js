import { useState, useEffect } from "react";
import axios from "axios";
import UserCard from "./components/UserCard";

const App = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(false);

    try {
      const response = await axios.get(
        "https://jsonplaceholder.typicode.com/users"
      );
      setUsers(response.data ?? []);
    } catch (err) {
      console.error("Can't fetch data", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      {loading && <p>Loading...</p>}

      {error && <p>Failed to load users</p>}

      {!loading &&
        !error &&
        users.map((u) => <UserCard key={u.id} user={u} />)}
    </div>
  );
};

export default App;
