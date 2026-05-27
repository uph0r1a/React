import { useState } from "react";
import "../App.css";

type GameProp = {
  level: number;
};

function Games({ level }: GameProp) {
  const [numberOfGuess, setNumberOfGuess] = useState(0);
  const [guessed, setGuessed] = useState<number | null>(null);
  const [guessList, setGuessList] = useState<number[]>([]);
  const [hint, setHint] = useState("");

  const [answer, setAnswer] = useState(
    Math.floor(Math.random() * level) + 1
  );

  const game = (e: any) => {
    e.preventDefault();

    if (guessed === null) 
      return;

    setNumberOfGuess((prev) => prev + 1);
    setGuessList((prev) => [...prev, guessed]);

    if (guessed > answer) {
      setHint("Lower");
    } else if (guessed < answer) {
      setHint("Higher");
    } else {
      setHint("Correct!");
    }
  };

  const resetGame = () => {
    setNumberOfGuess(0);
    setGuessed(null);
    setGuessList([]);
    setHint("");

    setAnswer(Math.floor(Math.random() * level) + 1);
  };

  return (
    <div id="game">
      <form onSubmit={game}>
        <label htmlFor="guess">Enter a number...</label>
        <input type="number"name="guess"id="guess"placeholder="?"onChange={(e) => setGuessed(Number(e.target.value))}/>
        <button type="submit">Guess</button>
      </form>

      <p>Answer: {answer}</p>

      <h1>{hint}</h1>

      <p>Number of guess: {numberOfGuess}</p>

      <p>Numbers guessed:</p>

      {guessList.map((guess, index) => (
        <p key={index}>{guess}</p>
      ))}

      <button onClick={resetGame}>Reset</button>
    </div>
  );
}

export default Games;