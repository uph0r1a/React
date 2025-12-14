import { useState } from "react";
import Display from "./components/Display";

const App = () => {

  const [count, setCount] = useState(0);
  return (
    <div>
      <Display count={count} />
      <button onClick={() => setCount(count + 1)}>Increase</button>
      <button onClick={() => setCount(count - 1)}>Decrease</button>
    </div>
  )
}

export default App