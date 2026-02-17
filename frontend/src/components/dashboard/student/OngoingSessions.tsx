import { useState, useEffect } from "react";
import { Clock, Calendar, QrCode, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { QRScannerModal } from "./QRScannerModal";
import { CuteSpinner } from "@/components/ui/CuteSpinner";
import api from "@/lib/axios";
import { toast } from "@/hooks/use-toast";

interface Session {
  id: number;
  course_id: number;
  session_date: string;
  session_time: string;
  duration_minutes: number;
  course_name: string;
  course_code: string;
  teacher_name: string;
  qr_code: string;
  valid_until: string;
  is_active: boolean;
  already_marked: boolean;
}

export const OngoingSessions = () => {
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    loadActiveSessions();
    
    // Refresh every 30 seconds to update countdown timers
    const interval = setInterval(loadActiveSessions, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadActiveSessions = async () => {
    try {
      const response = await api.get('/sessions/active');
      setActiveSessions(response.data.sessions || []);
    } catch (error) {
      console.error("Failed to load active sessions:", error);
      toast({
        title: "Error",
        description: "Failed to load active sessions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (validUntil: string) => {
    const now = new Date();
    const expiry = new Date(validUntil);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) {
      return "Expired";
    }

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s remaining`;
    }
    return `${seconds}s remaining`;
  };

  const handleMarkAttendance = (session: Session) => {
    setSelectedSession(session);
    setShowScanner(true);
  };

  const handleScanSuccess = () => {
    setShowScanner(false);
    setSelectedSession(null);
    loadActiveSessions();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Mark Attendance</h1>
          <p className="text-muted-foreground text-sm">
            Scan QR code for ongoing sessions
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <CuteSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Mark Attendance</h1>
          <p className="text-muted-foreground text-sm">
            Active sessions available for attendance
          </p>
        </div>
        <Button
          onClick={loadActiveSessions}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {activeSessions.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-sm font-medium text-foreground mb-1">
            No active sessions
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            There are no sessions available for attendance right now
          </p>
          <div className="text-xs text-left max-w-md mx-auto space-y-2 p-4 bg-muted/50 rounded-lg">
            <p className="font-medium">Possible reasons:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>You need to enroll in courses first</li>
              <li>No sessions have been started by teachers yet</li>
              <li>Active sessions have already expired</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeSessions.map((session) => (
            <div
              key={session.id}
              className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-foreground truncate">
                      {session.course_name}
                    </h3>
                    {session.already_marked ? (
                      <Badge variant="secondary" className="text-xs">
                        Marked
                      </Badge>
                    ) : getTimeRemaining(session.valid_until) === "Expired" ? (
                      <Badge variant="destructive" className="text-xs">
                        Expired
                      </Badge>
                    ) : (
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {session.course_code} • {session.teacher_name}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-muted-foreground mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {new Date(session.session_date).toLocaleDateString()}
                  </span>
                  <Clock className="w-3 h-3 ml-2" />
                  <span>{session.session_time}</span>
                </div>
                <div className="flex items-center gap-2 text-amber-600 font-medium">
                  <Clock className="w-3 h-3" />
                  <span className={getTimeRemaining(session.valid_until) === "Expired" ? "text-red-500" : ""}>
                    {getTimeRemaining(session.valid_until)}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => handleMarkAttendance(session)}
                className="w-full gap-2"
                size="sm"
                disabled={session.already_marked || getTimeRemaining(session.valid_until) === "Expired"}
              >
                <QrCode className="w-4 h-4" />
                {session.already_marked 
                  ? "Already Marked" 
                  : getTimeRemaining(session.valid_until) === "Expired"
                  ? "Session Expired"
                  : "Scan QR Code"
                }
              </Button>
            </div>
          ))}
        </div>
      )}

      {selectedSession && (
        <QRScannerModal
          open={showScanner}
          onOpenChange={setShowScanner}
          session={selectedSession}
          onSuccess={handleScanSuccess}
        />
      )}
    </div>
  );
};

