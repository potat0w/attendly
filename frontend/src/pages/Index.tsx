import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SignupForm from "@/components/SignupForm";
import CosmicBackground from "@/components/CosmicBackground";
import { useAuth } from "@api-hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, getRole } = useAuth();

  useEffect(() => {
    if (isAuthenticated()) {
      const role = getRole();
      navigate(role === "teacher" ? "/teacher-dashboard" : "/student-dashboard", { replace: true });
    }
  }, []);
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-6 lg:p-8">
        <div className="neumorphic-card p-4 md:p-6 lg:p-8 w-full max-w-md">
          <SignupForm />
        </div>
      </div>

      {/* Right Side - Cosmic Background */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-4 rounded-3xl overflow-hidden">
          <CosmicBackground />
        </div>
      </div>
    </div>
  );
};

export default Index;
