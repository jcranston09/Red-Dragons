import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { PlaybookProvider } from "./PlaybookContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PlaybookProvider>
      <App />
    </PlaybookProvider>
  </React.StrictMode>,
);
