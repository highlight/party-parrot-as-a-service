import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { H } from "highlight.run";

H.init("wve67ngp", {
  environment: "production",
});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
