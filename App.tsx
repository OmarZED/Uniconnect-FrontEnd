
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { CommunityFeed } from './components/CommunityFeed';
import { AcademicsView } from './components/AcademicsView';
import { AdminAcademics } from './components/AdminAcademics';
import { UserManagement } from './components/UserManagement';
import { UserProfile } from './components/UserProfile';
import { NotificationsView } from './components/NotificationsView';
import { CommunitiesView } from './components/CommunitiesView';
import { Register } from './components/Register';
import { Login } from './components/Login';
import { 
  UserDto, 
  Post, 
  FacultyDto, 
  CourseDto, 
  StudentGroupDto,
  RegisterDto, 
  LoginDto, 
  UserRole,
  Notification,
  CommunityDto
} from './types';
import { authService, userService, communityService, academicService } from './services/api';
import { Menu, Loader2, ArrowRight, Activity } from 'lucide-react';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState('community'); 
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dataRefreshTrigger, setDataRefreshTrigger] = useState(0);
  
  // Navigation Context for Single Community View
  const [viewingCommunityId, setViewingCommunityId] = useState<string | null>(null);

  // Data State
  const [currentUser, setCurrentUser] = useState<UserDto | undefined>(undefined);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Community Data
  const [allCommunities, setAllCommunities] = useState<CommunityDto[]>([]);
  const [myCommunities, setMyCommunities] = useState<CommunityDto[]>([]);

  // Academic Data State
  const [faculties, setFaculties] = useState<FacultyDto[]>([]);
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [studentGroups, setStudentGroups] = useState<StudentGroupDto[]>([]);

  const isAdmin = currentUser && currentUser.role !== UserRole.STUDENT;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser();
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !currentUser) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch notifications globally
        const notifRes = await communityService.getNotifications();
        if (notifRes.success && notifRes.data) setNotifications(notifRes.data);

        // Fetch My Communities for navigation logic in Academics view
        const myCommRes = await communityService.getMyCommunities();
        if (myCommRes.success && myCommRes.data) setMyCommunities(myCommRes.data);

        // Tab specific data
        if (activeTab === 'users' || activeTab === 'academics-manage' || activeTab === 'community') {
            const res = await userService.getAllUsers();
            if (res.success && res.data) setUsers(res.data);
        }
        
        if (activeTab === 'community') {
            const res = await communityService.getPosts();
            if (res.success && res.data) setPosts(res.data);
            
            const groupRes = await academicService.getStudentGroups();
            if (groupRes.success && groupRes.data) setStudentGroups(groupRes.data);
        }

        if (activeTab === 'discover') {
            const commRes = await communityService.getAllCommunities();
            if (commRes.success && commRes.data) setAllCommunities(commRes.data);
        }

        if (activeTab === 'academics-manage' || activeTab === 'my-academics' || activeTab === 'dashboard') {
            const facultyRes = await academicService.getFaculties();
            if (facultyRes.success && facultyRes.data) setFaculties(facultyRes.data);
            
            const courseRes = await academicService.getCourses();
            if (courseRes.success && courseRes.data) setCourses(courseRes.data);

            const groupRes = await academicService.getStudentGroups();
            if (groupRes.success && groupRes.data) setStudentGroups(groupRes.data);
        }
        
        if (activeTab === 'dashboard' && isAdmin) {
             const res = await userService.getAllUsers();
             if (res.success && res.data) setUsers(res.data);
        }
      } catch (err) {
        console.error("Error fetching tab data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab, isLoggedIn, currentUser, dataRefreshTrigger]);

  const handleDataRefresh = () => {
      setDataRefreshTrigger(prev => prev + 1);
  };

  const handleNavigateToCommunity = (communityId: string) => {
      setViewingCommunityId(communityId);
      setActiveTab('community');
      window.scrollTo(0, 0);
  };

  const handleBackToFeed = () => {
      setViewingCommunityId(null);
  };

  const fetchCurrentUser = async () => {
    setIsLoading(true);
    const response = await authService.getCurrentUser();
    if (response.success && response.data) {
      setCurrentUser(response.data);
      setIsLoggedIn(true);
      if (response.data.role === UserRole.STUDENT) {
          if (activeTab === 'dashboard') setActiveTab('community');
      } else {
          setActiveTab('dashboard');
      }
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsLoggedIn(false);
    }
    setIsLoading(false);
  };

  const handleRegister = async (data: RegisterDto) => {
    setIsLoading(true);
    const response = await authService.register(data);
    setIsLoading(false);

    if (response.success && response.data) {
        alert('Registration successful! Please sign in with your new account.');
        setAuthMode('login');
    } else {
        alert(response.message || 'Registration failed');
    }
  };

  const handleLogin = async (data: LoginDto) => {
    setIsLoading(true);
    const response = await authService.login(data);
    setIsLoading(false);

    if (response.success && response.data) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user)); // Persist user object
      setCurrentUser(response.data.user);
      setIsLoggedIn(true);
      setActiveTab(response.data.user.role === UserRole.STUDENT ? 'community' : 'dashboard');
    } else {
      alert(response.message || "Login failed");
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    setCurrentUser(undefined);
    setUsers([]);
    setPosts([]);
    setFaculties([]);
    setCourses([]);
    setMyCommunities([]);
    setViewingCommunityId(null);
  };
  
  const handleProfileUpdate = (updatedUser: UserDto) => {
      setCurrentUser(updatedUser);
  };

  const handleAddPost = async (post: Post) => {
    setPosts([post, ...posts]);
  };

  const handleUpdatePost = (updatedPost: Post) => {
      setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  const handleDeletePost = (postId: string) => {
      setPosts(posts.filter(p => p.id !== postId));
  };

  if (!isLoggedIn) {
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <Loader2 className="animate-spin text-red-900" size={48} />
            </div>
        );
    }
    if (authMode === 'login') {
      return <Login onLogin={handleLogin} onRegisterClick={() => setAuthMode('register')} />;
    } else {
      return <Register onRegister={handleRegister} onLoginClick={() => setAuthMode('login')} />;
    }
  }

  // Calculate unread notifications
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex min-h-screen bg-[#fafaf9] font-sans text-stone-900 selection:bg-red-200 selection:text-red-900">
       
       {/* Mobile Menu Button */}
       <button 
            onClick={() => setSidebarOpen(true)}
            className="fixed top-4 left-4 z-50 p-3 bg-white text-stone-900 rounded-2xl shadow-xl md:hidden hover:scale-105 transition-transform border border-stone-200"
       >
            <Menu size={24} />
       </button>

       {/* Mobile Sidebar Overlay */}
       {sidebarOpen && (
          <div 
             className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
             onClick={() => setSidebarOpen(false)}
          />
       )}

       {/* Mobile Sidebar */}
       <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white transform transition-transform duration-300 ease-in-out md:hidden shadow-2xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={(tab) => { setActiveTab(tab); setSidebarOpen(false); setViewingCommunityId(null); }} 
            currentUser={currentUser}
            onLogout={handleLogout}
            notificationCount={unreadCount}
          />
       </div>

       {/* Desktop Sidebar - Sticky container in flow */}
       <div className="hidden md:block w-72 flex-shrink-0 z-30">
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={(tab) => { setActiveTab(tab); setViewingCommunityId(null); }} 
            currentUser={currentUser}
            onLogout={handleLogout}
            notificationCount={unreadCount}
          />
       </div>

      <main className="flex-1 min-h-screen relative z-10 overflow-x-hidden">
         <div className="md:hidden h-20 bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-30"></div>

         <div className="container mx-auto">
            {isLoading && (
                 <div className="fixed top-6 right-6 z-50 bg-white/90 backdrop-blur-md p-4 rounded-full shadow-2xl animate-bounce ring-1 ring-stone-200">
                    <Loader2 className="animate-spin text-red-900" size={24} />
                 </div>
            )}

            {activeTab === 'dashboard' && isAdmin && currentUser && (
                <div className="p-8 max-w-7xl mx-auto">
                    <h1 className="text-4xl font-black text-stone-900 mb-8 tracking-tight">Overview</h1>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                         {[
                             { label: 'Total Users', value: users.length, color: 'text-stone-700', bg: 'bg-stone-100', icon: '👥' },
                             { label: 'Active Courses', value: courses.length, color: 'text-red-800', bg: 'bg-red-50', icon: '📚' },
                             { label: 'Faculties', value: faculties.length, color: 'text-red-900', bg: 'bg-red-100', icon: '🏛️' },
                             { label: 'Student Groups', value: studentGroups.length, color: 'text-stone-600', bg: 'bg-stone-50', icon: '🚀' },
                         ].map((stat, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-stone-100 hover:-translate-y-1 transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-stone-400 text-xs font-bold uppercase tracking-widest">{stat.label}</h3>
                                    <span className="text-xl">{stat.icon}</span>
                                </div>
                                <div className="flex items-end gap-3">
                                    <span className={`text-4xl font-black ${stat.color}`}>{stat.value}</span>
                                </div>
                            </div>
                         ))}
                    </div>

                    <div className="relative overflow-hidden bg-gradient-to-r from-red-900 to-stone-900 rounded-[2.5rem] p-12 text-white shadow-2xl shadow-red-900/20">
                         <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
                         <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full -ml-20 -mb-20 blur-3xl" />
                         
                         <div className="relative z-10">
                            <h2 className="text-4xl font-black mb-4 tracking-tight">Welcome back, {currentUser.firstName} 👋</h2>
                            <p className="text-stone-200 max-w-2xl text-lg leading-relaxed font-medium opacity-90">
                                Your academic ecosystem is running smoothly. You have full control over faculties, courses, and student groups from this central hub.
                            </p>
                            <button onClick={() => setActiveTab('academics-manage')} className="mt-8 bg-white text-red-900 px-8 py-4 rounded-2xl font-bold hover:bg-stone-50 transition-all flex items-center gap-3 shadow-lg hover:shadow-xl hover:-translate-y-1">
                                <span>Manage Academics</span>
                                <ArrowRight size={20} className="stroke-[3]" />
                            </button>
                         </div>
                    </div>
                </div>
            )}

            {activeTab === 'community' && currentUser && (
              <div className="py-6">
                 <div className="px-6 mb-2 md:text-center">
                    <span className="text-xs font-black text-red-800 uppercase tracking-widest">Social</span>
                    <h1 className="text-3xl font-black text-stone-900 tracking-tight">Campus Feed</h1>
                 </div>
                 <CommunityFeed 
                    user={currentUser} 
                    posts={posts} 
                    users={users} 
                    myCommunities={myCommunities}
                    studentGroups={studentGroups}
                    addPost={handleAddPost}
                    onUpdatePost={handleUpdatePost}
                    onDeletePost={handleDeletePost}
                    viewingCommunityId={viewingCommunityId}
                    onBack={handleBackToFeed}
                 />
              </div>
            )}

            {activeTab === 'discover' && currentUser && (
                <CommunitiesView allCommunities={allCommunities} user={currentUser} onUpdate={handleDataRefresh} />
            )}

            {activeTab === 'notifications' && (
                <NotificationsView notifications={notifications} />
            )}

            {activeTab === 'my-academics' && !isAdmin && (
                <AcademicsView 
                    faculties={faculties} 
                    courses={courses} 
                    studentGroups={studentGroups} 
                    user={currentUser} 
                    myCommunities={myCommunities}
                    onNavigate={handleNavigateToCommunity}
                />
            )}

            {activeTab === 'academics-manage' && isAdmin && currentUser && (
                <AdminAcademics 
                    faculties={faculties} 
                    courses={courses} 
                    studentGroups={studentGroups}
                    users={users}
                    currentUser={currentUser}
                    onUpdate={handleDataRefresh}
                    onNavigate={handleNavigateToCommunity}
                />
            )}

            {activeTab === 'users' && isAdmin && (
                <UserManagement users={users} setUsers={setUsers} />
            )}
            
            {activeTab === 'profile' && currentUser && (
                <UserProfile user={currentUser} onUpdate={handleProfileUpdate} />
            )}
            
            {activeTab === 'reports' && isAdmin && (
                <div className="p-8 flex flex-col items-center justify-center h-[80vh] text-stone-400 text-center">
                    <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                         <Activity size={48} className="text-stone-300" />
                    </div>
                    <h2 className="text-3xl font-black text-stone-800 tracking-tight">System Reports</h2>
                    <p className="max-w-md mt-3 text-lg font-medium text-stone-500">Analytics and moderation tools will appear here soon.</p>
                </div>
            )}
         </div>
      </main>
    </div>
  );
};

export default App;
