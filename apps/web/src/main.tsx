import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { resolveLanguage, usePreferencesStore } from "./stores/preferences";
import "./styles.css";

document.documentElement.lang = resolveLanguage(usePreferencesStore.getState().language);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
