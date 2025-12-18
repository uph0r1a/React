import React from "react";

function UserCard({ user }) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: 10,
        marginBottom: 10,
      }}
    >
      <h3>{user.name}</h3>
      <p>Email: {user.email}</p>
      <p>Phone: {user.phone}</p>
    </div>
  );
}

export default UserCard;
