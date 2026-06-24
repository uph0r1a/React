import { useState, useRef, useEffect } from "react";
import "../App.css";

type GameProp = {
  level: number;
};

type GuessResult = {
  value: number;
  result: "high" | "low" | "correct";
};

function Games({ level }: GameProp) {
  const [numberOfGuess, setNumberOfGuess] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [guessList, setGuessList] = useState<GuessResult[]>([]);
  const [hint, setHint] = useState("");
  const [hintClass, setHintClass] = useState("");
  const [won, setWon] = useState(false);

  const [answer] = useState(() => Math.floor(Math.random() * level) + 1);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const game = (e: React.FormEvent) => {
    e.preventDefault();
    if (won) return;

    const guessed = Number(inputValue);
    if (!inputValue || isNaN(guessed) || guessed < 1 || guessed > level) {
      setHint(`Enter a number between 1 and ${level.toLocaleString()}`);
      setHintClass("");
      return;
    }

    const count = numberOfGuess + 1;
    setNumberOfGuess(count);
    setInputValue("");

    let result: GuessResult["result"];
    if (guessed > answer) {
      setHint("Too high — go lower");
      setHintClass("high");
      result = "high";
    } else if (guessed < answer) {
      setHint("Too low — go higher");
      setHintClass("low");
      result = "low";
    } else {
      setHint("Correct!");
      setHintClass("correct");
      result = "correct";
      setWon(true);
    }

    setGuessList((prev) => [...prev, { value: guessed, result }]);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const resetGame = () => {
    setNumberOfGuess(0);
    setInputValue("");
    setGuessList([]);
    setHint("");
    setHintClass("");
    setWon(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const [, forceReset] = useState(0);
  const answerRef = useRef(answer);

  const handleReset = () => {
    answerRef.current = Math.floor(Math.random() * level) + 1;
    resetGame();
    forceReset((n) => n + 1);
  };

  return (
    <div id="game" className="card">
      {won && (
        <div className="win-banner">
          🎉 Correct! You found it in {numberOfGuess}{" "}
          {numberOfGuess === 1 ? "guess" : "guesses"}!
        </div>
      )}

      <form className="guess-row" onSubmit={game}>
        <input
          ref={inputRef}
          type="number"
          name="guess"
          id="guess"
          placeholder={`1 - ${level.toLocaleString()}`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          min={1}
          max={level}
          disabled={won}
          autoComplete="off"
        />
        <button type="submit" disabled={won}>
          Guess
        </button>
      </form>

      {hint && <div className={`hint ${hintClass}`}>{hint}</div>}

      <div className="stats-row">
        <div className="stat">
          <div className="stat-num">{numberOfGuess}</div>
          <div className="stat-label">Guesses</div>
        </div>
        <div className="stat">
          <div className="stat-num">1-{level.toLocaleString()}</div>
          <div className="stat-label">Range</div>
        </div>
      </div>

      {guessList.length > 0 && (
        <div className="history">
          {guessList.map((g, i) => (
            <span key={i} className={`guess-badge ${g.result}`}>
              {g.value}
            </span>
          ))}
        </div>
      )}

      <button className="reset-btn" type="button" onClick={handleReset}>
        ↺ New game
      </button>
    </div>
  );
}

export default Games;
