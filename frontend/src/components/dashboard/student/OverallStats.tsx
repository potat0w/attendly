import { useState, useEffect } from "react";
import { BookOpen, CalendarCheck, Clock, TrendingUp, Award, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useCourses } from "@api-hooks/useCourses";
import { useStats } from "@api-hooks/useStats";

export const OverallStats = () => {
  const { courses: rawCourses, getStudentEnrolledCourses } = useCourses();
  const { getStudentStats, getStudentOverallStats, stats } = useStats();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const studentId = user?.id;
  const [courseStats, setCourseStats] = useState<Record<number, { attendance: number; progress: number }>>({});
  const [overallStats, setOverallStats] = useState<any>(null);

  const courses = (rawCourses || []).map((c) => ({ 
    id: Number(c.id), 
    name: String(c.course_name ?? c.name ?? ""), 
    code: String(c.course_code ?? c.code ?? "") 
  }));

  useEffect(() => {
    getStudentEnrolledCourses().catch(() => {});
  }, []);

  useEffect(() => {
    if (!studentId) return;
    
    // Fetch overall stats
    getStudentOverallStats(studentId).then((result) => {
      setOverallStats(result);
    }).catch(() => {});
  }, [studentId]);

  useEffect(() => {
    if (!studentId || !rawCourses?.length) return;
    rawCourses.forEach((c) => {
      const courseId = Number(c.id);
      getStudentStats(studentId, courseId).then((r) => {
        const res = r as Record<string, unknown>;
        setCourseStats((prev) => ({
          ...prev,
          [courseId]: {
            attendance: Number(res.attendance ?? res.attendance_rate ?? 0),
            progress: Number(res.progress ?? 0),
          },
        }));
      }).catch(() => {});
    });
  }, [studentId, rawCourses?.length]);

  const coursePerformance = courses.map((c) => {
    const courseStat = overallStats?.courses?.find((course: any) => course.id === c.id);
    return {
      name: c.name,
      code: c.code,
      attendance: Math.round(courseStat?.attendance_percentage || 0),
      progress: courseStats[c.id]?.progress || 0, // Progress still comes from individual course stats
    };
  });

  const statsData = {
    totalCourses: overallStats?.overall?.total_enrolled_courses || courses.length,
    overallAttendance: Math.round(overallStats?.overall?.overall_attendance_percentage || 0),
    totalSessions: overallStats?.overall?.total_sessions || 0,
    attendedSessions: overallStats?.overall?.attended_sessions || 0,
    averageProgress: coursePerformance.length ? Math.round(coursePerformance.reduce((a, b) => a + b.progress, 0) / coursePerformance.length) : 0,
    rank: "N/A", // Rank data not available from API
  };
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Overall Stats</h1>
        <p className="text-muted-foreground text-sm">Your academic performance at a glance</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard 
          icon={BookOpen}
          label="Total Courses"
          value={statsData.totalCourses.toString()}
          sublabel="Enrolled"
          iconColor="text-primary"
        />
        <StatCard 
          icon={CalendarCheck}
          label="Overall Attendance"
          value={`${statsData.overallAttendance}%`}
          sublabel={statsData.overallAttendance >= 75 ? "Good standing" : "Needs improvement"}
          iconColor={statsData.overallAttendance >= 90 ? "text-green-500" : statsData.overallAttendance >= 75 ? "text-yellow-500" : "text-red-500"}
          valueColor={statsData.overallAttendance >= 90 ? "text-green-500" : statsData.overallAttendance >= 75 ? "text-yellow-500" : "text-red-500"}
        />
        <StatCard 
          icon={Clock}
          label="Sessions Attended"
          value={`${statsData.attendedSessions}/${statsData.totalSessions}`}
          sublabel="Total sessions"
          iconColor="text-blue-500"
        />
        <StatCard 
          icon={TrendingUp}
          label="Average Progress"
          value={`${statsData.averageProgress}%`}
          sublabel="Across all courses"
          iconColor="text-purple-500"
        />
        <StatCard 
          icon={Award}
          label="Class Rank"
          value={statsData.rank}
          sublabel="Based on performance"
          iconColor="text-amber-500"
        />
        <StatCard 
          icon={Target}
          label="Goal Progress"
          value={statsData.overallAttendance >= 75 ? "On Track" : "Needs Work"}
          sublabel="Based on attendance"
          iconColor={statsData.overallAttendance >= 75 ? "text-emerald-500" : "text-orange-500"}
        />
      </div>

      {/* Course-wise Performance */}
      <div className="p-4 rounded-lg bg-card border border-border">
        <h3 className="text-sm font-medium text-foreground mb-4">Course-wise Performance</h3>
        <div className="space-y-4">
          {coursePerformance.map((course) => (
            <div key={course.code} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{course.name}</p>
                  <p className="text-xs text-muted-foreground">{course.code}</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className={cn(
                    "font-medium",
                    course.attendance >= 90 ? "text-green-500" :
                    course.attendance >= 75 ? "text-yellow-500" : "text-red-500"
                  )}>
                    {course.attendance}% Attendance
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-1.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-4 rounded-lg bg-card border border-border">
          <h3 className="text-sm font-medium text-foreground mb-3">Attendance Summary</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Sessions</span>
              <span className="font-medium">{statsData.totalSessions}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Attended Sessions</span>
              <span className="font-medium text-green-500">{statsData.attendedSessions}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Missed Sessions</span>
              <span className="font-medium text-red-500">{statsData.totalSessions - statsData.attendedSessions}</span>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-lg bg-card border border-border">
          <h3 className="text-sm font-medium text-foreground mb-3">Performance Status</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className={`text-xs font-medium ${
                statsData.overallAttendance >= 90 ? "text-green-500" : 
                statsData.overallAttendance >= 75 ? "text-yellow-500" : "text-red-500"
              }`}>
                {statsData.overallAttendance >= 90 ? "Excellent" : 
                 statsData.overallAttendance >= 75 ? "Good" : "Needs Improvement"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Required Attendance</span>
              <span className="font-medium">75%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  sublabel: string;
  iconColor?: string;
  valueColor?: string;
}

const StatCard = ({ icon: Icon, label, value, sublabel, iconColor = "text-primary", valueColor }: StatCardProps) => (
  <div className="p-3 rounded-lg bg-card border border-border">
    <div className="flex items-center gap-2 mb-2">
      <Icon className={cn("w-4 h-4", iconColor)} />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
    <p className={cn("text-lg font-bold", valueColor || "text-foreground")}>{value}</p>
    <p className="text-xs text-muted-foreground">{sublabel}</p>
  </div>
);
