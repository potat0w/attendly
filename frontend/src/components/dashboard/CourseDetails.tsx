import { useState, useEffect } from "react";
import { ArrowLeft, BookOpen, Users, Calendar, Clock, Plus, ChevronDown, ChevronUp, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateSessionModal } from "./CreateSessionModal";
import { SessionQRModal } from "./SessionQRModal";
import { cn } from "@/lib/utils";
import type { Course, Session, Student } from "@/types/course";
import { useSessions } from "@api-hooks/useSessions";
import api from "@/lib/axios";

interface CourseDetailsProps {
  course: Course;
  onBack: () => void;
}

const mapToSession = (s: Record<string, unknown>): Session => ({
  id: Number(s.id),
  courseId: Number(s.course_id ?? s.courseId ?? 0),
  title: `Session ${new Date(String(s.session_date)).toLocaleDateString()} ${s.session_time}`,
  date: String(s.session_date ?? ""),
  time: String(s.session_time ?? ""),
  duration: s.duration_minutes ? `${s.duration_minutes} min` : "N/A",
  topic: s.topic ? String(s.topic) : undefined,
  attendance: s.attendance !== undefined ? Number(s.attendance) : undefined,
});

export const CourseDetails = ({ course, onBack }: CourseDetailsProps) => {
  const { loading: sessionsLoading, sessions: rawSessions, getCourseSessions } = useSessions();
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
  const [showAllStudents, setShowAllStudents] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [enrolledStudents, setEnrolledStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const sessions = (rawSessions || []).map(mapToSession);
 
  useEffect(() => {
    getCourseSessions(course.id).catch(() => {});
  }, [course.id]);

  useEffect(() => {
    const fetchStudents = async () => {
      setStudentsLoading(true);
      try {
        const response = await api.get(`/courses/${course.id}/students`);
        
        // Map API response to Student type
        const students = response.data.students.map((s: any) => ({
          id: s.id,
          name: s.name,
          email: s.email,
          rollNo: s.roll_number,
          batch: s.batch,
          attendance: Math.round(s.attendance_percentage || 0)
        }));
        
        setEnrolledStudents(students);
      } catch (error) {
        console.error('Failed to fetch enrolled students:', error);
        setEnrolledStudents([]);
      } finally {
        setStudentsLoading(false);
      }
    };

    fetchStudents();
  }, [course.id]);
 
  const refreshSessions = () => getCourseSessions(course.id).catch(() => {});
  const avgAttendance = enrolledStudents.length ? Math.round(enrolledStudents.reduce((acc, s) => acc + s.attendance, 0) / enrolledStudents.length) : 0;
  const displayedStudents = showAllStudents ? enrolledStudents : enrolledStudents.slice(0, 3);

  const handleShowQR = (sessionId: number) => {
    setSelectedSessionId(sessionId);
    setShowQRModal(true);
  };
 
   return (
     <div className="space-y-6">
       {/* Header */}
       <div className="flex items-start gap-4">
         <Button
           variant="ghost"
           size="sm"
           onClick={onBack}
           className="h-8 w-8 p-0 shrink-0"
         >
           <ArrowLeft className="w-4 h-4" />
         </Button>
         <div className="flex-1 min-w-0">
           <div className="flex items-center gap-2 mb-1">
             <span className="text-xs text-muted-foreground">{course.code}</span>
             <span
               className={cn(
                 "px-2 py-0.5 rounded-full text-xs font-medium",
                 course.status === "active"
                   ? "bg-primary/20 text-primary"
                   : course.status === "draft"
                   ? "bg-accent/20 text-accent-foreground"
                   : "bg-muted text-muted-foreground"
               )}
             >
               {course.status}
             </span>
           </div>
           <h1 className="text-xl font-bold text-foreground">{course.name}</h1>
           <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
         </div>
       </div>
 
       {/* Course Overview Stats */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
         {[
           { label: "Instructor", value: course.instructor, icon: BookOpen },
           { label: "Semester", value: course.semester, icon: Calendar },
           { label: "Students", value: course.students.toString(), icon: Users },
           { label: "Avg Attendance", value: `${avgAttendance}%`, icon: Clock },
         ].map((stat) => (
           <div
             key={stat.label}
             className="p-3 rounded-lg bg-card border border-border"
           >
             <div className="flex items-center gap-2 text-muted-foreground mb-1">
               <stat.icon className="w-3.5 h-3.5" />
               <span className="text-xs">{stat.label}</span>
             </div>
             <div className="text-sm font-semibold text-foreground">{stat.value}</div>
           </div>
         ))}
       </div>
 
       {/* Sessions Section */}
       <div>
         <div className="flex items-center justify-between mb-3">
           <h2 className="text-base font-semibold text-foreground">Sessions ({sessions.length})</h2>
           <Button size="sm" className="gap-1.5 text-sm" onClick={() => setIsCreateSessionOpen(true)}>
             <Plus className="w-3.5 h-3.5" />
             Create Session
           </Button>
         </div>
 
         {sessionsLoading ? (
           <div className="space-y-2">
             {[1, 2, 3].map((i) => (
               <div key={i} className="p-3 rounded-lg bg-card">
                 <Skeleton className="h-4 w-1/3 mb-2" />
                 <Skeleton className="h-3 w-2/3" />
               </div>
             ))}
           </div>
         ) : (
           <div className="space-y-2">
            {sessions.map((session, index) => (
              <div
                key={session.id}
                className={cn(
                  "p-3 rounded-lg bg-card border border-border",
                  "hover:border-primary/30 transition-colors",
                  "animate-fade-in"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-foreground">{session.title}</h3>
                    {session.topic && (
                      <p className="text-xs text-muted-foreground mt-0.5">{session.topic}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {session.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {session.time}
                      </span>
                      {session.attendance !== undefined && (
                        <span className="text-primary font-medium">{session.attendance} present</span>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleShowQR(session.id)}
                    variant="outline"
                    size="sm"
                    className="gap-1.5 shrink-0"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    QR Code
                  </Button>
                </div>
              </div>
            ))}
           </div>
         )}
       </div>
 
      {/* Students Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">Enrolled Students ({enrolledStudents.length})</h2>
        </div>

        {studentsLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            ))}
          </div>
        ) : enrolledStudents.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-lg bg-card border border-border border-dashed">
            <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No students enrolled yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayedStudents.map((student, index) => (
             <div
               key={student.id}
               className={cn(
                 "p-3 rounded-lg bg-card border border-border",
                 "animate-fade-in"
               )}
               style={{ animationDelay: `${index * 50}ms` }}
             >
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                   <span className="text-xs font-semibold text-primary">{student.name.charAt(0)}</span>
                 </div>
                 <div className="flex-1 min-w-0">
                   <h3 className="text-sm font-medium text-foreground">{student.name}</h3>
                   <p className="text-xs text-muted-foreground">{student.rollNo} • {student.email}</p>
                 </div>
                 <div className="text-right shrink-0">
                   <div
                     className={cn(
                       "text-sm font-medium",
                       student.attendance >= 90
                         ? "text-primary"
                         : student.attendance >= 75
                         ? "text-accent-foreground"
                         : "text-destructive"
                     )}
                   >
                     {student.attendance}%
                   </div>
                   <div className="text-xs text-muted-foreground">Attendance</div>
                 </div>
               </div>
             </div>
            ))}

            {enrolledStudents.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs gap-1"
                onClick={() => setShowAllStudents(!showAllStudents)}
              >
                {showAllStudents ? (
                  <>
                    Show less <ChevronUp className="w-3 h-3" />
                  </>
                ) : (
                  <>
                    Show all {enrolledStudents.length} students <ChevronDown className="w-3 h-3" />
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
 
      <CreateSessionModal open={isCreateSessionOpen} onOpenChange={setIsCreateSessionOpen} courses={[course]} onSuccess={refreshSessions} />
      
      {selectedSessionId && (
        <SessionQRModal
          open={showQRModal}
          onOpenChange={setShowQRModal}
          sessionId={selectedSessionId}
          courseName={course.name}
        />
      )}
    </div>
  );
};