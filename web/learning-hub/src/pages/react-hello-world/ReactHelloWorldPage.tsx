import { useState } from "react";
import "./react-hello-world.css";

function Child({ value }: { value: number }) {
  console.log("Child render");

  return <p>Value1: {value}</p>;
}

export default function ReactHelloWorldPage() {
  const [count, setCount] = useState(0);
  const [theme, setTheme] = useState(false);

  console.log("App render");

  return (
    <section className={`react-state-page ${theme ? "light" : "dark"}`}>
      <h1>React state</h1>
      <button onClick={() => setCount((current) => current + 1)}>Count: {count}</button>

      <button onClick={() => setTheme((current) => !current)}>Change theme</button>

      <Child value={count} />
    </section>
  );
}
