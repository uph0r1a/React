import { useState } from "react";
import "../App.css";

type GameProp = {
  level:number
}

function Games({level} :GameProp) {
  const [numberOfGuess, setNumberOfGuess] = useState(0)
  const [guessed, setGuessed] = useState("?")
  const answer = Math.floor(Math.random() * level) + 1
  const [guessList,setGetList] = useState<number[]>([])

  const game = () => {
    if (typeof guessed === "number") {
      setNumberOfGuess(numberOfGuess + 1)
      setGetList([...guessList,guessed])
    }

  }

  return (
    <div id="game">
      <form>
        <label htmlFor="guess">Enter a number...</label>
        <input type="number" name="guess" id="guess" placeholder={guessed} onChange={(e) => setGuessed(e.target.value)}/>
        <button type="submit" onClick={game}>Guess</button>
      </form>

      <p>Number of guess: {numberOfGuess}</p>
      <p>Numbers guessed: </p>
      {guessList.map((guess) => (
        <p>{guess}</p>
      ))}
      <button>Reset</button>
    </div>
  );
}

export default Games;
