import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    console.error("Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black overflow-hidden">

      {/* Radial glow */}
      <div
        className="pointer-events-none absolute inset-0 transition-all duration-300"
        style={{
          background: `radial-gradient(600px circle at ${50 + mousePos.x * 0.5}% ${50 + mousePos.y * 0.5}%, rgba(255,255,255,0.04), transparent 70%)`,
        }}
      />

      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Decorative corner lines */}
      <div className="pointer-events-none absolute top-8 left-8 w-16 h-16 border-t border-l border-white/20" />
      <div className="pointer-events-none absolute top-8 right-8 w-16 h-16 border-t border-r border-white/20" />
      <div className="pointer-events-none absolute bottom-8 left-8 w-16 h-16 border-b border-l border-white/20" />
      <div className="pointer-events-none absolute bottom-8 right-8 w-16 h-16 border-b border-r border-white/20" />

      {/* Floating orbs */}
      <div
        className="pointer-events-none absolute w-64 h-64 rounded-full border border-white/5"
        style={{
          top: "15%",
          left: "10%",
          transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)`,
          transition: "transform 0.1s ease-out",
        }}
      />
      <div
        className="pointer-events-none absolute w-40 h-40 rounded-full border border-white/5"
        style={{
          bottom: "20%",
          right: "15%",
          transform: `translate(${-mousePos.x * 0.2}px, ${-mousePos.y * 0.2}px)`,
          transition: "transform 0.1s ease-out",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 text-center px-8 max-w-lg">

        {/* 404 */}
        <div
          className="relative mb-2 select-none"
          style={{
            transform: `translate(${mousePos.x * 0.05}px, ${mousePos.y * 0.05}px)`,
            transition: "transform 0.15s ease-out",
          }}
        >
          <div
            className="text-[10rem] font-black leading-none tracking-tighter text-transparent"
            style={{
              WebkitTextStroke: "1.5px rgba(255,255,255,0.15)",
              position: "absolute",
              top: "6px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
            }}
          >
            404
          </div>
          <div
            className="text-[10rem] font-black leading-none tracking-tighter"
            style={{
              color: "white",
              WebkitTextStroke: "1px rgba(255,255,255,0.6)",
            }}
          >
            404
          </div>
        </div>

        {/* Thin divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/20" />
          <div className="w-1 h-1 rounded-full bg-white/40" />
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/20" />
        </div>

        {/* Text */}
        <div className="mb-2 text-xs font-semibold tracking-[0.35em] uppercase text-white/30">
          Page Not Found
        </div>
        <h1 className="text-2xl font-light text-white/90 mb-3 tracking-wide">
          Lost in the void
        </h1>
        <p className="text-white/40 text-sm leading-relaxed mb-10">
          The page at{" "}
          <span className="font-mono text-white/60 bg-white/5 px-2 py-0.5 rounded text-xs">
            {location.pathname}
          </span>{" "}
          doesn't exist or has been moved.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
          <Button
            asChild
            className="bg-white text-black hover:bg-white/90 font-medium tracking-wide transition-all duration-200 border-0 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]"
          >
            <Link to="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>

          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="border-white/20 text-white/70 hover:text-white hover:bg-white/5 hover:border-white/40 bg-transparent font-medium tracking-wide transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Footer links */}
        <div className="flex justify-center gap-6 text-xs text-white/25">
          <Link
            to="/student-dashboard"
            className="hover:text-white/60 transition-colors duration-200 tracking-wide uppercase"
          >
            Student
          </Link>
          <span className="text-white/10">·</span>
          <Link
            to="/teacher-dashboard"
            className="hover:text-white/60 transition-colors duration-200 tracking-wide uppercase"
          >
            Teacher
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;