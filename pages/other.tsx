import React from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { delay } from "../src/next/router";

export default function Hello() {
  const [state, setState] = React.useState(0);
  const query = useQuery(
    ["data"],
    async () => {
      await delay(2000);
      return { b: new Date() };
    },
    { suspense: true }
  );
  return (
    <div>
      Hellj {state} <button onClick={() => setState((s) => s + 1)}>+1</button>
      {query.data?.b.toString()}
      <Link to="/">Home</Link>
    </div>
  );
}
