"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, CheckCircle, ChevronRight, Lock } from "lucide-react";
import { ApiService } from "@/lib/api/service";
import { useUser } from "@/contexts/UserContext";
import { useProgress } from "@/contexts/ProgressContext";

// Derived from backend CourseSummary schema
interface CourseSummary {
    courseId: string;
    courseName: string;
    seriesName?: string;
    tagline: string;
    preparesFor: string[];
    totalLessons: number;
    estimatedDurationMinutes: number;
}

export default function Portfolio() {
    const router = useRouter();
    const { user, isLoading: userLoading } = useUser();
    const { progress, activeCourseId, setActiveCourseId } = useProgress();
    const [courses, setCourses] = useState<CourseSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userLoading && !user) {
            router.replace("/");
            return;
        }

        async function fetchCourses() {
            try {
                const data = await ApiService.getCourses();
                setCourses(data);
            } catch (err) {
                console.error("Failed to fetch courses", err);
            } finally {
                setLoading(false);
            }
        }

        fetchCourses();
    }, [user, userLoading, router]);

    const handleSelectCourse = (courseId: string) => {
        setActiveCourseId(courseId);
        router.push("/dashboard");
    };

    if (userLoading || loading) return <div className="min-h-screen pt-20 text-center">Loading Portfolio...</div>;

    // Grouping logic (Active vs Available)
    const activeCourses = courses.filter(c => progress.course_progress?.[c.courseId]);
    const discoverCourses = courses.filter(c => !progress.course_progress?.[c.courseId]);

    const renderCourseCard = (course: CourseSummary, isActive: boolean) => {
        const courseData = progress.course_progress?.[course.courseId];
        const completedLessons = courseData?.completed_lessons?.length || 0;
        const progressPercent = Math.round((completedLessons / course.totalLessons) * 100);

        return (
            <div
                key={course.courseId}
                onClick={() => handleSelectCourse(course.courseId)}
                className={`p-5 rounded-3xl mb-4 border transition-all cursor-pointer group ${activeCourseId === course.courseId
                        ? "bg-teal-50 border-teal-200 shadow-md ring-2 ring-teal-500/20"
                        : "bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-teal-100"
                    }`}
            >
                <div className="flex justify-between items-start mb-3">
                    <div>
                        {course.seriesName && (
                            <div className="text-[10px] font-black uppercase text-teal-600 tracking-wider mb-1">
                                {course.seriesName}
                            </div>
                        )}
                        <h3 className="text-xl font-black text-gray-900 leading-tight">
                            {course.courseName}
                        </h3>
                    </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 font-medium leading-relaxed">
                    {course.tagline}
                </p>

                {isActive ? (
                    <div>
                        <div className="flex justify-between text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                            <span>Your Progress</span>
                            <span className="text-teal-600">{progressPercent}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-teal-400 to-teal-500"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 text-xs font-bold text-gray-500 border-t border-gray-100 pt-3">
                        <div className="flex items-center gap-1">
                            <BookOpen size={14} className="text-teal-500" />
                            <span>{course.totalLessons} Lessons</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                            <span>~{Math.round(course.estimatedDurationMinutes / 60)} Hrs</span>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-24">
            <div className="pt-10 px-6 pb-6 bg-white border-b border-gray-100 sticky top-0 z-10">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Portfolio</h1>
                <p className="text-sm text-gray-500 font-medium mt-1">Explore and manage your learning tracks</p>
            </div>

            <div className="px-6 py-6">
                {(activeCourses.length > 0) && (
                    <div className="mb-8">
                        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Your Active Tracks</h2>
                        {activeCourses.map(c => renderCourseCard(c, true))}
                    </div>
                )}

                <div>
                    <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Discover More</h2>
                    {discoverCourses.length > 0 ? (
                        discoverCourses.map(c => renderCourseCard(c, false))
                    ) : (
                        <p className="text-sm text-gray-500 italic">No new courses available right now.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
