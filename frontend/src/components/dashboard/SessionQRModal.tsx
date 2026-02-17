import { useEffect, useState } from "react";
import { Download, QrCode, Clock, Calendar, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSessions } from "@api-hooks/useSessions";
import { Skeleton } from "@/components/ui/skeleton";

interface SessionQRModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: number;
  courseName?: string;
}

function formatSeconds(totalSeconds: number): string {
  if (totalSeconds <= 0) return "Expired";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export const SessionQRModal = ({
  open,
  onOpenChange,
  sessionId,
  courseName,
}: SessionQRModalProps) => {
  const { getSessionById } = useSessions();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (open && sessionId) {
      loadSession();
    }
  }, [open, sessionId]);

  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev === null ? null : Math.max(0, prev - 1)));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  const loadSession = async () => {
    setLoading(true);
    setSecondsLeft(null);
    try {
      const data = await getSessionById(sessionId);
      setSession(data);
      if (data.seconds_remaining != null && data.seconds_remaining >= 0) {
        setSecondsLeft(Math.max(0, Math.floor(Number(data.seconds_remaining))));
      } else if (data.valid_until) {
        const diffMs = new Date(data.valid_until).getTime() - Date.now();
        setSecondsLeft(Math.max(0, Math.floor(diffMs / 1000)));
      } else if (data.created_at) {
        const createdAt = new Date(data.created_at).getTime();
        const dur = ((data.duration_minutes != null ? data.duration_minutes : 60) * 60000);
        const diffMs = createdAt + dur - Date.now();
        setSecondsLeft(Math.max(0, Math.floor(diffMs / 1000)));
      } else {
        setSecondsLeft(0);
      }
    } catch (error) {
      console.error("Failed to load session:", error);
    } finally {
      setLoading(false);
    }
  };

  const timeRemaining = secondsLeft === null ? "" : formatSeconds(secondsLeft);

  const handleDownload = () => {
    if (!session?.qr_code_image) return;

    const link = document.createElement("a");
    link.href = session.qr_code_image;
    link.download = `qr-${courseName || "session"}-${sessionId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Session QR Code
          </DialogTitle>
          <DialogDescription className="text-sm">
            Show this QR code to students to mark their attendance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="w-full aspect-square rounded-lg" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <>
              <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">
                    {courseName || session?.course_name}
                  </span>
                  {timeRemaining && (
                    <span
                      className={`text-xs font-medium ${
                        timeRemaining === "Expired"
                          ? "text-red-500"
                          : "text-orange-500"
                      }`}
                    >
                      {timeRemaining === "Expired"
                        ? "Expired"
                        : `Valid for: ${timeRemaining}`}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {(() => {
                      try {
                        if (!session?.session_date) return "N/A";
                        const dateStr = session.session_date.includes('T') 
                          ? session.session_date.split('T')[0] 
                          : session.session_date;
                        return new Date(dateStr).toLocaleDateString();
                      } catch {
                        return session?.session_date || "N/A";
                      }
                    })()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {session?.session_time || "N/A"}
                  </span>
                  {session?.duration_minutes && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {session.duration_minutes} min
                    </span>
                  )}
                </div>
              </div>

              <div className="relative bg-white p-6 rounded-lg border-2 border-border">
                {session?.qr_code_image ? (
                  <img
                    src={session.qr_code_image}
                    alt="Session QR Code"
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="aspect-square flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <QrCode className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">QR code not available</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="flex-1 gap-2"
                  size="sm"
                  disabled={!session?.qr_code_image}
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button
                  onClick={() => onOpenChange(false)}
                  variant="default"
                  className="flex-1"
                  size="sm"
                >
                  Close
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Students can scan this code to mark their attendance
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

