import dayjs from "dayjs";
import React from "react";
import { useState } from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { Preview } from "../app/Preview";
import { delay } from "../src/next/router";

export default function Hello() {
  const [state, setState] = React.useState(0);
  const [responseSize, setResponseSize] = useState({ width: 700, height: 400 });
  return (
    <div>
      Helkjjhghjgghgvjhgfjlj {state}{" "}
      <button onClick={() => setState((s) => s + 1)}>+1</button>
      <div className="relative w-120 h-120">
        <Preview
          responsiveSize={responseSize}
          onChangeResponsiveSize={setResponseSize}
        />
      </div>
    </div>
  );
}
