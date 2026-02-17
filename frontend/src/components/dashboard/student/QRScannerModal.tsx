import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAttendance } from "@api-hooks/useAttendance";
import { toast } from "@/hooks/use-toast";

interface QRScannerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: {
    id: number;
    course_name?: string;
    session_time?: string;
    session_date?: string;
    validUntil?: Date;
  };
  onSuccess?: () => void;
}

export const QRScannerModal = ({
  open,
  onOpenChange,
  session,
  onSuccess,
}: QRScannerModalProps) => {
  const { markAttendance } = useAttendance();

  const scannerRef = useRef<Html5Qrcode | null>(null);

  const [isStarting, setIsStarting] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      cleanupScanner();
    }
    return () => {
      cleanupScanner();
    };
  }, [open]);

  const cleanupScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear();
      } catch (err) {
        console.error("Scanner cleanup error:", err);
      }
      scannerRef.current = null;
    }
    setScanning(false);
    setIsStarting(false);
  };

  const startScanner = async () => {
    if (scannerRef.current || isStarting) return;

    const reader = document.getElementById("qr-reader");
    if (!reader) {
      setTimeout(startScanner, 300);
      return;
    }

    try {
      setIsStarting(true);
      setError(null);

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        onScanSuccess,
        onScanError
      );

      setScanning(true);
    } catch (err: any) {
      console.error("Camera start failed:", err);
      
      let errorMsg = "Camera access failed. ";
      if (err.name === "NotAllowedError" || err.message?.includes("Permission")) {
        errorMsg += "Please allow camera permission when browser asks.";
      } else if (err.name === "NotFoundError") {
        errorMsg += "No camera found on your device.";
      } else if (err.name === "NotReadableError") {
        errorMsg += "Camera is already in use. Close other apps using camera.";
      } else {
        errorMsg += "Please try using Chrome or Safari browser.";
      }
      
      setError(errorMsg);
      cleanupScanner();
    } finally {
      setIsStarting(false);
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    if (!scannerRef.current || success) return;

    console.log("✅ QR Code scanned:", decodedText);

    cleanupScanner();
    setIsStarting(true);

    try {
      console.log("📤 Marking attendance...");
      const result = await markAttendance(decodedText);
      console.log("✅ Attendance marked:", result);
      
      setSuccess(true);

      toast({
        title: "Attendance Marked!",
        description: `Your attendance for ${session.course_name} has been recorded.`,
      });

      setTimeout(() => {
        onSuccess?.();
        onOpenChange(false);
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      console.error("❌ Attendance marking failed:", err);
      const errorMsg = err?.message || "Failed to mark attendance. Please try again.";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsStarting(false);
    }
  };

  const onScanError = (errorMessage: string) => {
    if (!errorMessage.includes("NotFoundException")) {
      console.debug("QR scan error:", errorMessage);
    }
  };

  const handleClose = () => {
    cleanupScanner();
    onOpenChange(false);
  };

  const getTimeRemaining = () => {
    if (!session.validUntil) return "";
    const diff = session.validUntil.getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const m = Math.floor(diff / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
          <DialogDescription>
            Open your camera and scan the QR shown by your teacher
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-muted/50 text-xs">
            <div className="font-medium">{session.course_name}</div>
            <div className="text-muted-foreground flex justify-between">
              <span>
                {session.session_date} • {session.session_time}
              </span>
              {session.validUntil && (
                <span className="text-orange-500">
                  Valid: {getTimeRemaining()}
                </span>
              )}
            </div>
          </div>

          <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
            {success ? (
              <div className="flex flex-col items-center justify-center h-full text-white">
                <CheckCircle2 className="w-16 h-16 text-green-500 mb-3" />
                Attendance Marked
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full text-white p-6">
                <AlertCircle className="w-14 h-14 text-red-500 mb-3" />
                <p className="text-center text-sm mb-4">{error}</p>
                <Button 
                  size="sm" 
                  onClick={() => {
                    setError(null);
                    startScanner();
                  }}
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <>
                <div id="qr-reader" className="w-full h-full" />
                {!scanning && !isStarting && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                    <Button onClick={startScanner} size="lg">
                      <Camera className="w-5 h-5 mr-2" />
                      Open Camera
                    </Button>
                  </div>
                )}
                {isStarting && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <p className="text-sm">Starting camera...</p>
                  </div>
                )}
                {scanning && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="relative w-64 h-64 border-2 border-primary rounded-lg">
                      <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl"></div>
                      <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr"></div>
                      <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl"></div>
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br"></div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {scanning && (
            <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-2">
              <Camera className="w-4 h-4" />
              Position QR code within the frame
            </p>
          )}

          <Button variant="outline" size="sm" onClick={handleClose} className="w-full">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
