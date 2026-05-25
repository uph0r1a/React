import { useState } from "react";
import "./App.css";
import Games from "./components/Games";
import Instruction from "./components/Instruction";

function App() {
  const [tab, changeTab] = useState("game");
  const [level, setLevel] = useState("10")

  return (
    <>
      <h1>Guess the number</h1>
      <p>Can you guess the number?</p>

      <form>
        <label htmlFor="level">Select a level: </label>
        <select name="level" id="level" value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="10">Easy (1-10)</option>
          <option value="50">Normal (1-50)</option>
          <option value="100">Hard (1-100)</option>
          <option value="1000">Super (1-1000)</option>
        </select>
      </form>

      <div>
        <div id="nav">
          <button id="game" onClick={(e) => changeTab(e.currentTarget.id)}>
            Game
          </button>
          <button
            id="instruction"
            onClick={(e) => changeTab(e.currentTarget.id)}
          >
            Instruction
          </button>
        </div>
        <div id="tab">
          {tab === "game" && <Games level={Number(level)} />}
          {tab === "instruction" && <Instruction />}
        </div>
      </div>
    </>
  );
}

export default App;
