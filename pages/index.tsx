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
      return { a: new Date() };
    },
    { suspense: true }
  );
  return (
    <div>
      Helkjjhghjgghgvjhgfjlj {state}{" "}
      <button onClick={() => setState((s) => s + 1)}>+1</button>
      {query.data?.a.toISOString()}
      <Link to="/other">Other</Link>
    </div>
  );
}
