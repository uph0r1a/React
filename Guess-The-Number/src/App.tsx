import { useState } from "react";
import "./App.css";
import Games from "./components/Games";
import Instruction from "./components/Instruction";

function App() {
  const [tab, changeTab] = useState("game");
  const [level, setLevel] = useState("10");

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLevel(e.target.value);
    changeTab("game");
  };

  return (
    <>
      <h1>Guess the number</h1>
      <p className="subtitle">Can you guess the hidden number?</p>

      <div className="level-row">
        <label htmlFor="level">Level:</label>
        <select
          name="level"
          id="level"
          value={level}
          onChange={handleLevelChange}
        >
          <option value="10">Easy (1-10)</option>
          <option value="50">Normal (1-50)</option>
          <option value="100">Hard (1-100)</option>
          <option value="1000">Super (1-1000)</option>
        </select>
      </div>

      <div>
        <div id="nav">
          <button
            className={tab === "game" ? "active" : ""}
            onClick={() => changeTab("game")}
          >
            Game
          </button>
          <button
            className={tab === "instruction" ? "active" : ""}
            onClick={() => changeTab("instruction")}
          >
            Instructions
          </button>
        </div>

        <div id="tab">
          {tab === "game" && <Games key={level} level={Number(level)} />}
          {tab === "instruction" && <Instruction />}
        </div>
      </div>
    </>
  );
}

export default App;
