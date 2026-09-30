import { useNavigate } from "react-router";
import RegisterModal from "../components/landing/RegisterModal";
import Login from "./Login";

export default function Register() {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate("/");
  };

  return (
    <div className="relative min-h-screen">
      {/* Background landing view */}
      <Login />

      {/* Always open pop-up modal on /register route */}
      <RegisterModal open={true} onClose={handleClose} onSwitchToSignIn={() => navigate("/")} />
    </div>
  );
}
