import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import LandingPage from "./pages/LandingPage";
import SignInPage from "./pages/SignInPage";
import RidePostAndRequestPage from "./pages/RidePostAndRequestPage";
import UserSettingsPage from "./pages/UserSettingsPage";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/rides" element={<RidePostAndRequestPage />} />
        <Route path="/settings" element={<UserSettingsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
