import logo from './logo.svg';
import './App.css';

function App() {
  const person = {
    name: "Thai Duc Tri",
    age: 19,
    job: "HS",
    hobbies: ["Gameing", "Coding", "Hanging out"]
  };

  return (
    <div style={styles.container}>
      <h1>Personal info</h1>

      <p><strong>Name:</strong> {person.name}</p>
      <p><strong>Age:</strong> {person.age}</p>
      <p><strong>Job:</strong> {person.job}</p>

      <strong>Hobbies:</strong>
      <ul>
        {person.hobbies.map((hobby, index) => (
          <li key={index}>{hobby}</li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial",
    backgroundColor: "#f4f4f4",
    width: "350px",
    borderRadius: "10px",
    margin: "20px auto"
  }
};

export default App;
