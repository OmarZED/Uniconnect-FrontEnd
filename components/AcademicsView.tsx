
import React from 'react';
import { FacultyDto, CourseDto, StudentGroupDto, UserDto, CommunityDto, CommunityType } from '../types';
import { Building2, Book, Users, ChevronRight, GraduationCap, ArrowUpRight } from 'lucide-react';

interface AcademicsViewProps {
  faculties: FacultyDto[];
  courses: CourseDto[];
  studentGroups: StudentGroupDto[];
  user: UserDto;
  myCommunities: CommunityDto[];
  onNavigate: (communityId: string) => void;
}

export const AcademicsView: React.FC<AcademicsViewProps> = ({ 
    faculties, courses, studentGroups, user, myCommunities, onNavigate 
}) => {
  
  // Filter lists to only show what the user is assigned to
  const myFaculties = faculties.filter(f => f.id === user.facultyId);
  const myCourses = courses.filter(c => c.id === user.courseId);
  const myGroups = studentGroups.filter(g => g.id === user.studentGroupId);
  const myDepartments = myCommunities.filter(c => c.type === CommunityType.Department);

  const hasAssignments = myFaculties.length > 0 || myCourses.length > 0 || myGroups.length > 0 || myDepartments.length > 0;

  // Helper to find the community ID for an academic entity
  const findCommunityId = (type: CommunityType, entityId: string) => {
      let found;
      if (type === CommunityType.Faculty) found = myCommunities.find(c => c.facultyId === entityId);
      else if (type === CommunityType.Course) found = myCommunities.find(c => c.courseId === entityId);
      else if (type === CommunityType.Group) found = myCommunities.find(c => c.studentGroupId === entityId);
      
      return found?.id;
  };

  const handleCardClick = (type: CommunityType, entityId: string) => {
      const commId = findCommunityId(type, entityId);
      if (commId) {
          onNavigate(commId);
      } else {
          alert("Community feed not found for this item.");
      }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {/* Subtle ambient gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-red-100/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-stone-200/30 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 p-6 md:p-10 lg:p-12 max-w-7xl mx-auto">
        {/* Hero Header */}
        <div className="mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-stone-200/60 mb-5">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-semibold text-stone-600">My Studies</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight">
            Your Academic <span className="text-red-900">Hub</span>
          </h1>
          
          <p className="mt-3 text-lg text-stone-500 max-w-xl leading-relaxed">
            Everything about your academic journey in one place.
          </p>
        </div>

        {!hasAssignments ? (
          // Empty State
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-[2.5rem] p-12 md:p-16 text-center shadow-[0_8px_40px_-15px_rgba(0,0,0,0.08)] border border-stone-100">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-stone-100 to-stone-50 rounded-full flex items-center justify-center shadow-inner">
                <GraduationCap className="w-10 h-10 text-stone-400" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-2">No Assignments Yet</h3>
              <p className="text-stone-500 leading-relaxed">
                You haven't been assigned to a Faculty, Course, or Student Group. 
                Contact your administrator to get started.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Faculty Section - Full Width Hero Card */}
            {myFaculties.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-900 to-red-800 shadow-lg shadow-red-200 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-stone-800">Your Faculty</h2>
                    <p className="text-xs text-stone-500">Home department</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {myFaculties.map(faculty => (
                    <div 
                      key={faculty.id}
                      onClick={() => handleCardClick(CommunityType.Faculty, faculty.id)}
                      className="group cursor-pointer"
                    >
                      <div className="relative">
                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-red-900/10 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="relative bg-white rounded-[2rem] p-7 md:p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.06)] border border-stone-100 group-hover:shadow-[0_20px_50px_-15px_rgba(120,53,15,0.15)] group-hover:-translate-y-1.5 transition-all duration-400 ease-out">
                          {/* Top accent bar */}
                          <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-red-800 to-red-600 rounded-full" />
                          
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-2xl font-black text-stone-800 group-hover:text-red-900 transition-colors duration-300">
                                {faculty.name}
                              </h3>
                              <span className="inline-block mt-3 px-3 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-800 border border-red-100">
                                {faculty.code}
                              </span>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-stone-50 flex items-center justify-center group-hover:bg-red-50 group-hover:scale-110 transition-all duration-300">
                              <ArrowUpRight className="w-5 h-5 text-stone-400 group-hover:text-red-600" />
                            </div>
                          </div>

                          {faculty.deanName && (
                            <div className="mt-6 pt-5 border-t border-stone-100">
                              <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-stone-100 to-white shadow-sm flex items-center justify-center">
                                  <GraduationCap className="w-5 h-5 text-stone-500" />
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Dean</p>
                                  <p className="text-sm font-bold text-stone-700">{faculty.deanName}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Two Column Layout for Courses and Groups */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              
              {/* Courses Section */}
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-stone-700 to-stone-800 shadow-lg shadow-stone-200 flex items-center justify-center">
                    <Book className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-stone-800">Active Courses</h2>
                    <p className="text-xs text-stone-500">Your enrolled subjects</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {myCourses.length > 0 ? myCourses.map(course => (
                    <div 
                      key={course.id}
                      onClick={() => handleCardClick(CommunityType.Course, course.id)}
                      className="group cursor-pointer"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-stone-900/5 rounded-2xl translate-y-1 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="relative bg-white rounded-2xl p-5 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.05)] border border-stone-100/80 group-hover:shadow-[0_12px_35px_-12px_rgba(0,0,0,0.12)] group-hover:-translate-y-1 transition-all duration-300 ease-out">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-stone-100 to-stone-50 shadow-inner flex items-center justify-center shrink-0 group-hover:bg-gradient-to-br group-hover:from-red-900 group-hover:to-red-700 transition-all duration-300">
                              <Book className="w-5 h-5 text-stone-500 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-bold text-stone-800 group-hover:text-red-900 transition-colors truncate">
                                  {course.name}
                                </h4>
                                <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600">
                                  Year {course.year}
                                </span>
                              </div>
                              <p className="text-sm text-stone-500 mt-1 truncate">{course.facultyName || 'General Faculty'}</p>
                              <div className="mt-3 pt-3 border-t border-stone-50 flex items-center justify-between">
                                <code className="text-[10px] font-mono text-stone-400 bg-stone-50 px-2 py-0.5 rounded">{course.code}</code>
                                <span className="text-xs font-semibold text-red-800 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  Open <ChevronRight className="w-3 h-3" />
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="p-6 bg-stone-50/80 rounded-2xl border-2 border-dashed border-stone-200 text-center">
                      <p className="text-stone-400 text-sm font-medium">No courses assigned</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Study Groups Section */}
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-800 to-red-900 shadow-lg shadow-red-200 flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-stone-800">Study Groups</h2>
                    <p className="text-xs text-stone-500">Your learning circles</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {myGroups.length > 0 ? myGroups.map(group => (
                    <div 
                      key={group.id}
                      onClick={() => handleCardClick(CommunityType.Group, group.id)}
                      className="group cursor-pointer"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-red-900/5 rounded-2xl translate-y-1 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="relative bg-white rounded-2xl p-5 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.05)] border border-stone-100/80 group-hover:shadow-[0_12px_35px_-12px_rgba(120,53,15,0.12)] group-hover:-translate-y-1 transition-all duration-300 ease-out">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-50 to-white shadow-sm flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                              <Users className="w-5 h-5 text-red-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-stone-800 group-hover:text-red-900 transition-colors truncate">
                                {group.name}
                              </h4>
                              <p className="text-sm text-stone-500 mt-1 line-clamp-1">{group.description || 'Study together'}</p>
                              <div className="mt-3 pt-3 border-t border-stone-50 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-stone-400 bg-stone-50 px-2 py-0.5 rounded uppercase tracking-wider">{group.code}</span>
                                <span className="text-xs font-semibold text-stone-500">{group.studentCount || 0} members</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="p-6 bg-stone-50/80 rounded-2xl border-2 border-dashed border-stone-200 text-center">
                      <p className="text-stone-400 text-sm font-medium">No groups assigned</p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Departments Section - Full Width */}
            {myDepartments.length > 0 && (
              <section className="pt-4">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-stone-600 to-stone-700 shadow-lg shadow-stone-200 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-stone-800">Department Communities</h2>
                    <p className="text-xs text-stone-500">Communities you're part of</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {myDepartments.map(dept => (
                    <div 
                      key={dept.id}
                      onClick={() => onNavigate(dept.id)}
                      className="group cursor-pointer"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-stone-900/5 rounded-2xl translate-y-1 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="relative bg-white rounded-2xl p-5 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.05)] border border-stone-100/80 group-hover:shadow-[0_12px_35px_-12px_rgba(0,0,0,0.12)] group-hover:-translate-y-1 transition-all duration-300 ease-out">
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-stone-100 to-stone-50 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-red-50 group-hover:to-red-100 transition-all duration-300">
                              <Building2 className="w-4 h-4 text-stone-500 group-hover:text-red-600 transition-colors" />
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-stone-300 group-hover:text-red-600 transition-colors" />
                          </div>
                          <h4 className="font-bold text-stone-800 text-sm group-hover:text-red-900 transition-colors line-clamp-1 mb-1">
                            {dept.name}
                          </h4>
                          <p className="text-xs text-stone-500 line-clamp-2 mb-3">{dept.description || 'Department community'}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-stone-500 bg-stone-50 px-2 py-1 rounded">{dept.memberCount} members</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </div>
  );
};
