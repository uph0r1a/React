import { useState } from "react";
import "./App.css";
const dice1 = "/images/dice1.svg";
const dice2 = "/images/dice2.svg";
const dice3 = "/images/dice3.svg";
const dice4 = "/images/dice4.svg";
const dice5 = "/images/dice5.svg";
const dice6 = "/images/dice6.svg";

function App() {
  const [number_of_dices, setNumberOfDices] = useState("1");
  const [sum, setSum] = useState(0);
  const [product, setProduct] = useState(0);
  const [results, setResults] = useState<number[]>([]);
  const n = Number(number_of_dices);

  function formatProduct(num: number) {
    if (num === 0) return "0";

    const threshold = 1e10;

    if (Math.abs(num) <= threshold) {
      return Math.trunc(num).toString();
    }

    const exponent = Math.floor(Math.log10(Math.abs(num)));
    const mantissaRaw = num / Math.pow(10, exponent);

    let mantissa = mantissaRaw.toFixed(9);

    mantissa = mantissa.replace(/\.?0+$/, "");

    return `${mantissa} x 10^${exponent}`;
  }

  const roll = (e: any) => {
    e.preventDefault();

    const newResults: number[] = [];

    for (let i = 0; i < n; i++) {
      const r = Math.floor(Math.random() * 6) + 1;
      newResults.push(r);
    }

    setResults(newResults);

    setSum(newResults.reduce((a, b) => a + b, 0));

    setProduct(
      newResults.reduce((acc, val) => (acc === 0 ? val : acc * val), 0),
    );
  };
  const dice = [dice1, dice2, dice3, dice4, dice5, dice6];

  return (
    <div className="app">
      <h1>Dice Roller</h1>
      <div className="dice-container">
        {results.map((item, index) => (
          <img key={index} src={dice[item - 1]} alt="" />
        ))}
      </div>
      <p>Sum: {sum}</p>
      <p>Product: {formatProduct(product)}</p>
      <form>
        <label htmlFor="dice_number">Number of Dice: </label>
        <input
          type="number"
          value={number_of_dices}
          onChange={(e) => setNumberOfDices(e.target.value)}
          min={1}
        />
        <button type="submit" onClick={roll}>
          Roll dice
        </button>
      </form>
    </div>
  );
}

export default App;
