
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
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-12">
        <span className="text-xs font-black text-red-900 uppercase tracking-widest bg-red-100 px-3 py-1 rounded-full">Student Portal</span>
        <h2 className="text-4xl font-black text-stone-900 mt-3 tracking-tight">My Academics</h2>
        <p className="text-stone-500 text-lg font-medium mt-1">Your personalized learning journey.</p>
      </div>

      {!hasAssignments ? (
          <div className="bg-white rounded-[2rem] p-12 text-center border border-stone-100 shadow-sm">
              <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-300">
                  <GraduationCap size={40} />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">No Academic Assignments</h3>
              <p className="text-stone-500 max-w-md mx-auto">
                  You haven't been assigned to a Faculty, Course, or Student Group yet. 
                  Please update your profile or contact administration.
              </p>
          </div>
      ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Faculties Column */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-stone-700 flex items-center gap-2 text-lg">
                  <Building2 size={20} className="text-red-900" />
                  Your Faculty
                </h3>
              </div>
              
              {myFaculties.length > 0 ? myFaculties.map(faculty => (
                <div 
                    key={faculty.id} 
                    onClick={() => handleCardClick(CommunityType.Faculty, faculty.id)}
                    className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
                >
                   <div className="absolute top-0 left-0 w-full h-1.5 bg-red-900" />
                   <div className="absolute top-4 right-4 bg-red-50 text-red-900 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight size={20} />
                   </div>
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                        <h4 className="font-black text-stone-800 text-2xl group-hover:text-red-900 transition-colors">{faculty.name}</h4>
                        <span className="bg-red-50 text-red-900 text-xs font-bold px-3 py-1 rounded-full mt-3 inline-block tracking-wider">{faculty.code}</span>
                        {faculty.deanName && (
                          <div className="mt-6 flex items-center gap-3 pt-6 border-t border-stone-50">
                            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                                 <GraduationCap size={18}/> 
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Dean</p>
                                <p className="text-sm font-bold text-stone-700">{faculty.deanName}</p>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-6 bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-stone-400 text-sm font-medium text-center">
                    No Faculty Assigned
                </div>
              )}
            </div>

            {/* Courses and Groups Column */}
            <div className="col-span-2 space-y-12">
              {/* Courses */}
              <div>
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-stone-700 flex items-center gap-2 text-lg">
                      <Book size={20} className="text-stone-600" />
                      Active Courses
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {myCourses.length > 0 ? myCourses.map(course => {
                        return (
                            <div 
                                key={course.id} 
                                onClick={() => handleCardClick(CommunityType.Course, course.id)}
                                className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm hover:shadow-lg hover:shadow-stone-200/50 transition-all group cursor-pointer"
                            >
                                <div className="flex items-start justify-between mb-5">
                                     <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-600 group-hover:bg-stone-800 group-hover:text-white transition-colors">
                                         <Book size={24} />
                                     </div>
                                     <span className="text-xs font-bold text-stone-600 bg-stone-100 px-3 py-1 rounded-full">
                                        Year {course.year}
                                     </span>
                                </div>
                                <h4 className="font-bold text-stone-800 text-xl leading-tight group-hover:text-red-900 transition-colors">{course.name}</h4>
                                <p className="text-sm text-stone-500 mt-2 font-medium">{course.facultyName || 'General Faculty'}</p>
                                
                                <div className="mt-6 pt-4 border-t border-stone-50 flex items-center justify-between">
                                    <span className="text-xs font-mono text-stone-400 font-bold">{course.code}</span>
                                    <span className="text-xs font-bold text-red-900 flex items-center gap-1 group-hover:underline">
                                        Go to Community <ChevronRight size={14} />
                                    </span>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="col-span-full p-6 bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-stone-400 text-sm font-medium text-center">
                            No Active Course Assigned
                        </div>
                    )}
                  </div>
              </div>

              {/* Student Groups */}
              <div>
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-stone-700 flex items-center gap-2 text-lg">
                      <Users size={20} className="text-red-700" />
                      Study Groups
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myGroups.length > 0 ? myGroups.map(group => (
                        <div 
                            key={group.id} 
                            onClick={() => handleCardClick(CommunityType.Group, group.id)}
                            className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm hover:shadow-md transition-all group hover:-translate-y-1 cursor-pointer"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                 <div className="w-10 h-10 rounded-full bg-red-50 text-red-700 flex items-center justify-center group-hover:rotate-12 transition-transform">
                                     <Users size={18} />
                                 </div>
                                 <span className="font-bold text-stone-800 text-sm leading-tight">{group.name}</span>
                            </div>
                            <p className="text-xs text-stone-500 mb-5 line-clamp-2 font-medium">{group.description || 'No description available.'}</p>
                            <div className="flex justify-between items-center">
                                 <span className="bg-stone-100 text-stone-500 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">{group.code}</span>
                                 <span className="text-xs text-stone-400 font-bold">{group.studentCount || 0} Members</span>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full p-6 bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-stone-400 text-sm font-medium text-center">
                            No Student Group Assigned
                        </div>
                    )}
                  </div>
              </div>

              {/* Department Communities */}
              <div>
                  <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-stone-700 flex items-center gap-2 text-lg">
                        <Building2 size={20} className="text-stone-500" />
                        My Departments
                      </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {myDepartments.length > 0 ? myDepartments.map(dept => (
                          <div 
                            key={dept.id} 
                            onClick={() => onNavigate(dept.id)}
                            className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm hover:shadow-md transition-all group hover:-translate-y-1 cursor-pointer relative overflow-hidden"
                          >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-stone-100 rounded-full -mr-12 -mt-12 opacity-50"></div>
                                <h4 className="font-bold text-stone-800 text-lg mb-2 relative z-10">{dept.name}</h4>
                                <p className="text-xs text-stone-500 mb-4 line-clamp-2 relative z-10">{dept.description || 'Departmental community.'}</p>
                                <div className="flex items-center justify-between relative z-10">
                                    <span className="text-xs font-bold text-stone-600 bg-stone-100 px-2 py-1 rounded-md">{dept.memberCount} Members</span>
                                    <ArrowUpRight size={16} className="text-stone-300 group-hover:text-stone-500 transition-colors"/>
                                </div>
                          </div>
                      )) : (
                          <div className="col-span-full p-6 bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-stone-400 text-sm font-medium text-center">
                              Not a member of any department communities.
                          </div>
                      )}
                  </div>
              </div>

            </div>
          </div>
      )}
    </div>
  );
};
