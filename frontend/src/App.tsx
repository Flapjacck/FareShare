import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import SignUpSuccess from "./pages/SignUpSuccess";
import Ridesearch from "./pages/Ridesearch";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Ridesearch />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signup/success" element={<SignUpSuccess />} />
        <Route path="/rides" element={<Ridesearch />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
