import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import SignInPage from "./pages/SignInPage"; // ✅ import your page

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<SignInPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
