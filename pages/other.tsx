import React from "react";
import { Link } from "react-router-dom";

export default function Hello() {
  const [state, setState] = React.useState(0);
  return (
    <div>
      Hellj {state} <button onClick={() => setState((s) => s + 1)}>+1</button>
      <Link to="/other">Other</Link>
    </div>
  );
}
