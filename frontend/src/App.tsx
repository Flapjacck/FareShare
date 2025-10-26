import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import SignUpSuccess from "./pages/SignUpSuccess";
import RidePostAndRequestPage from "./pages/RidePostAndRequestPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
  <Route path="/" element={<RidePostAndRequestPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signup/success" element={<SignUpSuccess />} />
        <Route path="/rides" element={<RidePostAndRequestPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
