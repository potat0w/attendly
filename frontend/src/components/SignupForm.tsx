import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthInput } from "./ui/AuthInput";
import { AuthSelect } from "./ui/AuthSelect";
import { Button } from "./ui/button";
import { GraduationCap, Users } from "lucide-react";
import { useAuth } from "@api-hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { CuteSpinner } from "./ui/CuteSpinner";

type UserRole = "student" | "teacher";
type AuthMode = "login" | "signup";

const SignupForm = () => {
  const navigate = useNavigate();
  const { loading, error, studentSignup, studentLogin, teacherSignup, teacherLogin } = useAuth();
  const [role, setRole] = useState<UserRole>("student");
  const [mode, setMode] = useState<AuthMode>("signup");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    rollNumber: "",
    batch: "2024",
    academicSession: "2024-2025",
  });

  const batchOptions = [
    { value: "2024", label: "2024" },
    { value: "2023", label: "2023" },
    { value: "2022", label: "2022" },
    { value: "2021", label: "2021" },
  ];

  const sessionOptions = [
    { value: "2024-2025", label: "2024-2025" },
    { value: "2023-2024", label: "2023-2024" },
    { value: "2022-2023", label: "2022-2023" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === "signup") {
        if (role === "student") {
          await studentSignup({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            roll_number: formData.rollNumber,
            batch: formData.batch,
            academic_session: formData.academicSession,
          });
          toast({ title: "Account created!", description: "Welcome! Redirecting to dashboard." });
          navigate("/student-dashboard");
        } else {
          await teacherSignup({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          });
          toast({ title: "Account created!", description: "Welcome! Redirecting to dashboard." });
          navigate("/teacher-dashboard");
        }
      } else {
        if (role === "student") {
          await studentLogin(formData.email, formData.password);
          toast({ title: "Logged in!", description: "Welcome back!" });
          navigate("/student-dashboard");
        } else {
          await teacherLogin(formData.email, formData.password);
          toast({ title: "Logged in!", description: "Welcome back!" });
          navigate("/teacher-dashboard");
        }
      }
    } catch {
      toast({ title: "Error", description: error || "Something went wrong", variant: "destructive" });
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 text-primary mb-2">
          <GraduationCap className="w-5 h-5" />
          <span className="text-xs font-medium">Student</span>
        </div>
        <h1 className="text-xl font-semibold text-foreground">
          {mode === "signup" ? "Create a new account" : "Welcome back"}
        </h1>
      </div>

      {/* Auth Mode Tabs */}
      <div className="flex gap-4 mb-4 border-b border-border">
        <button
          onClick={() => setMode("login")}
          className={`pb-2 text-sm font-medium transition-colors relative ${
            mode === "login"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Login
          {mode === "login" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setMode("signup")}
          className={`pb-2 text-sm font-medium transition-colors relative ${
            mode === "signup"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Signup
          {mode === "signup" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">I am a:</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg transition-all text-sm ${
                  role === "student"
                    ? "bg-primary text-primary-foreground"
                    : "neumorphic-input text-muted-foreground hover:text-foreground"
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span className="font-medium">Student</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("teacher")}
                className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg transition-all text-sm ${
                  role === "teacher"
                    ? "bg-primary text-primary-foreground"
                    : "neumorphic-input text-muted-foreground hover:text-foreground"
                }`}
              >
                <Users className="w-4 h-4" />
                <span className="font-medium">Teacher</span>
              </button>
            </div>
        </div>

        {mode === "signup" && (
          <AuthInput
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
          />
        )}

        <AuthInput
          label="Email"
          type="email"
          placeholder="your@email.com"
          value={formData.email}
          onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
        />

        <AuthInput
          label="Password"
          showPasswordToggle
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
        />

        {mode === "signup" && role === "student" && (
          <>
            <AuthInput
              label="Roll Number"
              type="text"
              placeholder="CS2024001"
              value={formData.rollNumber}
              onChange={(e) => setFormData((p) => ({ ...p, rollNumber: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-4">
              <AuthSelect
                label="Batch"
                options={batchOptions}
                value={formData.batch}
                onChange={(e) => setFormData((p) => ({ ...p, batch: e.target.value }))}
              />
              <AuthSelect
                label="Academic Session"
                options={sessionOptions}
                value={formData.academicSession}
                onChange={(e) => setFormData((p) => ({ ...p, academicSession: e.target.value }))}
              />
            </div>
          </>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-9 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium mt-4 text-sm transition-all hover:scale-[1.01]"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <CuteSpinner size="sm" />
              <span>{mode === "signup" ? "Creating..." : "Signing in..."}</span>
            </div>
          ) : mode === "signup" ? "Create Account" : "Sign In"}
        </Button>
      </form>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground mt-4">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <button
              onClick={() => setMode("login")}
              className="text-primary hover:underline"
            >
              Sign in
            </button>
          </>
        ) : (
          <>
            Don't have an account?{" "}
            <button
              onClick={() => setMode("signup")}
              className="text-primary hover:underline"
            >
              Sign up
            </button>
          </>
        )}
      </p>
    </div>
  );
};

export default SignupForm;
