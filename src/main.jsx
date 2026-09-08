import React from "react";
import ReactDOM from "react-dom/client";
import RituApp from "./RituApp.jsx";

// RituApp.jsx was originally built against a sandboxed `window.storage`
// API. This shim backs it with localStorage so the app runs standalone.
// Swap it out once real auth + cloud sync (Section 6 of the plan) is wired up.
if (!window.storage) {
  window.storage = {
    async get(key) {
      const value = localStorage.getItem(key);
      return value === null ? null : { value };
    },
    async set(key, value) {
      localStorage.setItem(key, value);
    },
    async delete(key) {
      localStorage.removeItem(key);
    },
  };
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RituApp />
  </React.StrictMode>
);
