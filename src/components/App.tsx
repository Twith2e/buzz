import { Route, Routes } from "react-router-dom";
import WelcomePage from "../pages/WelcomePage";
import Dashboard from "../pages/Dashboard";
import SignupPage from "../pages/AuthPage";
import OtpPage from "../pages/OtpPage";
import Onboard from "../pages/Onboard";
import CurrentScreen from "./CurrentScreen";
import GlobalUI from "./GlobalUI";

export default function App() {
  return (
    <>
      <GlobalUI />
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="dashboard" element={<CurrentScreen />} />
        <Route path="otp/:id" element={<OtpPage />} />
        <Route path="complete-registration/:id" element={<Onboard />} />
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </>
  );
}
