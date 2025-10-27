import "./App.css";
import SignInPage from "./pages/SignInPage";
import UserSettingsPage from "./pages/UserSettingsPage";

function App() {
  return (
    <div>
      {/* Render whichever page you want as the default view */}
      <SignInPage />
      {/* <UserSettingsPage /> */}
    </div>
  );
}

export default App;
