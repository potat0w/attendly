import { WifiOff, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

const ElegantOfflinePage = () => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [stars, setStars] = useState([]);

  useEffect(() => {
    // Generate random stars
    const generatedStars = Array.from({ length: 50 }, () => ({
      id: Math.random(),
      left: Math.random() * 100,
      top: Math.random() * 50,
      delay: Math.random() * 2,
    }));
    setStars(generatedStars);
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 overflow-hidden relative">
      {/* Starfield */}
      <div className="absolute inset-0 overflow-hidden">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute w-1 h-1 bg-gray-400 rounded-full animate-pulse"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              animationDelay: `${star.delay}s`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pb-32 pt-20">
        <div className="text-center space-y-8 max-w-2xl mx-auto">
          {/* Icon with glow */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-white/10 blur-2xl rounded-full w-32 h-32 -z-10"></div>
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-white/10 to-white/20 border border-white/30 flex items-center justify-center backdrop-blur-sm">
                <WifiOff className="w-12 h-12 text-white animate-bounce" />
              </div>
            </div>
          </div>

          {/* Main heading with gradient */}
          <div className="space-y-4">
            <div className="text-8xl sm:text-9xl font-black font-mono tracking-tighter">
              <span className="text-white">O</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-600">FF</span>
              <span className="text-white">L</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-gray-700">IN</span>
              <span className="text-white">E</span>
            </div>

            <p className="text-gray-300 text-lg font-light tracking-widest uppercase pt-4">
              The page you're looking for was not accessible!
            </p>
          </div>

          {/* Description */}
          <p className="text-gray-400 text-base leading-relaxed max-w-md mx-auto">
            Your internet connection appears to be offline. Please check your connection and try again.
          </p>

          {/* Action button */}
          <div className="pt-8 flex flex-col gap-4 items-center max-w-sm mx-auto">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className={`group w-full px-8 py-3 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 border border-gray-600 ${
                isRetrying
                  ? "bg-gray-700 cursor-not-allowed opacity-50"
                  : "bg-gradient-to-r from-gray-800 to-gray-900 hover:from-blue-600/20 hover:to-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20"
              }`}
            >
              <RefreshCw className={`w-5 h-5 ${isRetrying ? "animate-spin" : "group-hover:rotate-180"}`} />
              {isRetrying ? "Reconnecting..." : "Try Again"}
            </button>

            <div className="w-full relative">
              <input
                type="text"
                placeholder="Search..."
                disabled
                className="w-full px-6 py-3 rounded-full bg-gray-900/50 border border-gray-700 text-gray-300 placeholder-gray-500 focus:outline-none focus:border-gray-600 backdrop-blur-sm"
              />
              <button disabled className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 opacity-50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            <div className="text-xs text-gray-600 pt-2">
              Error Code: <span className="font-mono text-gray-500">NETWORK_OFFLINE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wavy terrain */}
      <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none">
        <svg viewBox="0 0 1440 120" className="absolute bottom-20 w-full h-auto text-slate-700" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,40 Q360,10 720,40 T1440,40 L1440,120 L0,120 Z" opacity="0.5" />
        </svg>
        <svg viewBox="0 0 1440 120" className="absolute bottom-10 w-full h-auto text-slate-800" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,60 Q360,20 720,60 T1440,60 L1440,120 L0,120 Z" opacity="0.7" />
        </svg>
        <svg viewBox="0 0 1440 120" className="absolute bottom-0 w-full h-auto text-emerald-900" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,70 Q360,40 720,70 T1440,70 L1440,120 L0,120 Z" opacity="0.6" />
        </svg>
      </div>
    </div>
  );
};

export default ElegantOfflinePage;