 import { useState } from "react";
 import { Loader2 } from "lucide-react";
 import { useSessions } from "@api-hooks/useSessions";
 import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
 } from "@/components/ui/dialog";
 import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import { toast } from "@/hooks/use-toast";
 import { cn } from "@/lib/utils";
 
 interface CreateSessionModalProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   courses?: { id: number; name: string; code?: string }[];
   onSuccess?: () => void;
 }
 
export const CreateSessionModal = ({ open, onOpenChange, courses = [], onSuccess }: CreateSessionModalProps) => {
  const { loading: isLoading, createSession } = useSessions();
  const [formData, setFormData] = useState({
    course: "",
    duration: "30",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.course) newErrors.course = "Please select a course";
    if (!formData.duration.trim()) newErrors.duration = "Duration is required";
    const durationNum = parseInt(formData.duration);
    if (isNaN(durationNum) || durationNum < 1) {
      newErrors.duration = "Duration must be at least 1 minute";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
 
 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   if (!validateForm()) return;
   try {
     const durationMinutes = parseInt(formData.duration);
     await createSession({
       course_id: Number(formData.course),
       duration_minutes: durationMinutes,
     });
     toast({
       title: "Session started!",
       description: `Session created and active for ${durationMinutes} minutes.`,
     });
     setFormData({ course: "", duration: "30" });
     onOpenChange(false);
     onSuccess?.();
   } catch {
     toast({ title: "Error", description: "Failed to create session", variant: "destructive" });
   }
 };
 
   const handleChange = (field: string, value: string) => {
     setFormData((prev) => ({ ...prev, [field]: value }));
     if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
   };
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Start New Session</DialogTitle>
          <DialogDescription className="text-sm">
            Create a session that starts immediately. Students can scan QR for the specified duration.
          </DialogDescription>
        </DialogHeader>
 
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="course" className="text-sm">Course</Label>
            <Select value={formData.course} onValueChange={(value) => handleChange("course", value)}>
              <SelectTrigger className={cn("h-9 text-sm", errors.course && "border-destructive")}>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={String(course.id)} className="text-sm">
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.course && <p className="text-xs text-destructive">{errors.course}</p>}
          </div>

          <div className="p-3 rounded-lg bg-muted/50 space-y-1">
            <p className="text-xs font-medium text-foreground">Session will start:</p>
            <p className="text-sm text-muted-foreground">Immediately (as soon as you create it)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration" className="text-sm">Duration (minutes)</Label>
            <Select value={formData.duration} onValueChange={(value) => handleChange("duration", value)}>
              <SelectTrigger className={cn("h-9 text-sm", errors.duration && "border-destructive")}>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="180">3 hours</SelectItem>
              </SelectContent>
            </Select>
            {errors.duration && <p className="text-xs text-destructive">{errors.duration}</p>}
            <p className="text-xs text-muted-foreground">
              QR code will be valid for this duration
            </p>
          </div>
 
           <div className="flex gap-2 pt-2">
             <Button type="button" variant="outline" onClick={() => onOpenChange(false)} size="sm" className="flex-1">
               Cancel
             </Button>
            <Button type="submit" disabled={isLoading} size="sm" className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Start Session Now"
              )}
            </Button>
           </div>
         </form>
       </DialogContent>
     </Dialog>
   );
 };