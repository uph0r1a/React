import "../App.css";

function Instruction() {
  return (
    <div id="instruction">
      <p>
        Guess the <b>number</b>
      </p>
      <p>Select a level...</p>
      <ul>
        <li>Easy (1-10)</li>
        <li>Normal (1-50)</li>
        <li>Hard (1-100)</li>
        <li>Super (1-1000)</li>
      </ul>
      <p>Enter a number between 1 and the maximum (10, 50, 100 or 1,000).</p>
      <p>If the number you guessed is too high or too low, try again.</p>
      <b>Clues</b>
      <table>
        <tr>
          <td id="high">1</td>
          <td>Your guess is too high</td>
        </tr>
        <tr>
          <td id="low">2</td>
          <td>Your guess is too low</td>
        </tr>
        <tr>
          <td id="correct">3</td>
          <td>Your guess is correct</td>
        </tr>
      </table>
    </div>
  );
}

export default Instruction;
