import { useState } from "react";

function Child({ value }: { value: number }) {
  console.log("Child render");

  return <p>Value1: {value}</p>;
}

export default function App() {
  const [count, setCount] = useState(0);
  const [theme, setTheme] = useState(false);

  console.log("App render");

  return (
    <>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>

      <button onClick={() => setTheme(!theme)}>Change theme</button>

      <Child value={count} />
    </>
  );
}
