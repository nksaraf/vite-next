import React from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { delay } from "../src/next/router";
import * as dayjs from "dayjs";
export default function Hello() {
  const [state, setState] = React.useState(0);
  const query = useQuery(
    ["data", "c"],
    async () => {
      await delay(2000);
      return { b: dayjs().format("HH:MM:ss") };
    },
    { suspense: true }
  );
  return (
    <div>
      Hellj {state} <button onClick={() => setState((s) => s + 1)}>+1</button>
      {query.data?.b}
      <Link to="/">Home</Link>
    </div>
  );
}
