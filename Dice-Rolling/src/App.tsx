const dice1 = "/images/dice1.svg"
const dice2 = "/images/dice2.svg"
const dice3 = "/images/dice3.svg"
const dice4 = "/images/dice4.svg"
const dice5 = "/images/dice5.svg"
const dice6 = "/images/dice6.svg"


function App() {
  const roll = (number_of_dices:number = 1) => {
    let results:number[] = []
    for (let i = 0; i < number_of_dices; i++) {
      results.push(Math.floor(Math.random() * (6 - 1 + 1))+1)  
    }
    
  }

  return (
    <div className="app">
      <h1>Dice Roller</h1>
      <img src="" alt="" />
      <p>Sum: {}</p>
      <p>Product: {}</p>
      <form>
        <label htmlFor="dice_number">Number of Dice: </label>
        <input type="number" name="dice_number" id="dice_number" />
        <button type="submit">Roll dice</button>
      </form>
    </div>
  )
}

export default App
