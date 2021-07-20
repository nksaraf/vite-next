import dayjs from "dayjs";
import React from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";

export default function Hello() {
  const [state, setState] = React.useState(0);
  const query = useQuery(
    ["data", "a"],
    async () => {
      return { a: dayjs().format("HH:MM:ss") };
    },
    { suspense: true }
  );
  return (
    <div>
      Helkjjhghjgghgvjhgfjlj {state}{" "}
      <button onClick={() => setState((s) => s + 1)}>+1</button>
      {query.data?.a}
      <Link to="/other">Other</Link>
    </div>
  );
}
