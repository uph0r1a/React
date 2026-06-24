import "../App.css";

function Instruction() {
  return (
    <div id="instruction">
      <div className="card">
        <p>
          Guess the <b>hidden number</b> within the selected range. After each
          guess you'll get a hint to help narrow it down.
        </p>

        <b>Levels</b>
        <ul>
          <li>Easy — 1 to 10</li>
          <li>Normal — 1 to 50</li>
          <li>Hard — 1 to 100</li>
          <li>Super — 1 to 1,000</li>
        </ul>
        <p>Changing the level starts a brand-new game.</p>

        <b>Clues</b>
        <table className="clue-table">
          <tbody>
            <tr>
              <td>
                <span id="high" className="pill">
                  Too high
                </span>
              </td>
              <td>Your guess is above the answer — try a lower number.</td>
            </tr>
            <tr>
              <td>
                <span id="low" className="pill">
                  Too low
                </span>
              </td>
              <td>Your guess is below the answer — try a higher number.</td>
            </tr>
            <tr>
              <td>
                <span id="correct" className="pill">
                  Correct!
                </span>
              </td>
              <td>You found the number — well done!</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Instruction;
