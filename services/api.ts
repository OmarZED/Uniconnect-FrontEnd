import { 
  LoginDto, 
  RegisterDto, 
  ApiResponse, 
  LoginResponseDto, 
  UserDto, 
  Post, 
  CreatePostDto,
  UpdatePostDto,
  FacultyDto,
  CourseDto,
  StudentGroupDto,
  UpdateProfileDto,
  UserRole,
  CreateFacultyDto,
  CreateCourseDto,
  CreateStudentGroupDto,
  Notification,
  ReactionType,
  CommunityDto,
  CommunityType,
  CommunityRole,
  CreateDepartmentCommunityDto,
  UpdateCommunityDto,
  UpdateFacultyDto,
  UpdateCourseDto,
  UpdateStudentGroupDto,
  CommentDto,
  CreateCommentDto,
  UpdateCommentDto,
  VoteType
} from '../types';

const API_URL = (import.meta as any).env?.VITE_API_URL || '';

// Helper for authorized requests
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    try {
        const headers = { ...getAuthHeaders(), ...(options.headers || {}) };
        const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
        
        if (response.status === 401) {
            // Handle unauthorized globally if needed (e.g., redirect to login)
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return { success: false, message: "Unauthorized" };
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`API Error at ${endpoint}:`, error);
        return { success: false, message: "Network error occurred." };
    }
};

// --- Auth Services ---

export const authService = {
  login: async (credentials: LoginDto): Promise<ApiResponse<LoginResponseDto>> => {
    return request<LoginResponseDto>('/api/Auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
        headers: { 'Content-Type': 'application/json' } // Override to avoid sending null token
    });
  },

  register: async (data: RegisterDto): Promise<ApiResponse<UserDto>> => { 
    return request<UserDto>('/api/Auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
    });
  },

  logout: async (): Promise<ApiResponse<any>> => {
    const res = await request('/api/Auth/logout', { method: 'POST' });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return res;
  },
  
  getCurrentUser: async (): Promise<ApiResponse<UserDto>> => {
    const token = localStorage.getItem('token');
    if (!token) return { success: false, message: 'No token' };
    return request<UserDto>('/api/Auth/me');
  },

  updateProfile: async (data: UpdateProfileDto): Promise<ApiResponse<UserDto>> => {
    const res = await request<UserDto>('/api/Auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data)
    });
    if (res.success && res.data) {
        localStorage.setItem('user', JSON.stringify(res.data));
    }
    return res;
  }
};

// --- Domain Services ---

export const userService = {
  getAllUsers: async (): Promise<ApiResponse<UserDto[]>> => {
    // Assuming a UsersController exists based on AdminAcademics requirements
    return request<UserDto[]>('/api/Users');
  },
};

export const communityService = {
  // --- POSTS ---
  getPosts: async (): Promise<ApiResponse<Post[]>> => {
    return request<Post[]>('/api/Posts/feed');
  },
  
  createPost: async (postData: CreatePostDto): Promise<ApiResponse<Post>> => {
    return request<Post>('/api/Posts', {
        method: 'POST',
        body: JSON.stringify(postData)
    });
  },

  updatePost: async (id: string, data: UpdatePostDto): Promise<ApiResponse<Post>> => {
    return request<Post>(`/api/Posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
  },

  deletePost: async (id: string): Promise<ApiResponse<object>> => {
    return request<object>(`/api/Posts/${id}`, {
        method: 'DELETE'
    });
  },

  toggleReaction: async (postId: string, reactionType: ReactionType): Promise<ApiResponse<any>> => {
    return request(`/api/Posts/${postId}/react`, {
        method: 'POST',
        body: JSON.stringify({ reactionType })
    });
  },

  getNotifications: async (): Promise<ApiResponse<Notification[]>> => {
      // Assuming a NotificationsController exists
      return request<Notification[]>('/api/Notifications');
  },

  // --- COMMUNITIES ---
  
  getAllCommunities: async (): Promise<ApiResponse<CommunityDto[]>> => {
      return request<CommunityDto[]>('/api/Communities');
  },

  getMyCommunities: async (): Promise<ApiResponse<CommunityDto[]>> => {
    return request<CommunityDto[]>('/api/Communities/my-communities');
  },

  getOwnedCommunities: async (): Promise<ApiResponse<CommunityDto[]>> => {
    return request<CommunityDto[]>('/api/Communities/owned');
  },

  createDepartmentCommunity: async (data: CreateDepartmentCommunityDto): Promise<ApiResponse<CommunityDto>> => {
    return request<CommunityDto>('/api/Communities/department', {
        method: 'POST',
        body: JSON.stringify(data)
    });
  },

  joinCommunity: async (id: string): Promise<ApiResponse<any>> => {
      return request(`/api/Communities/${id}/join`, { method: 'POST' });
  },

  leaveCommunity: async (id: string): Promise<ApiResponse<any>> => {
    return request(`/api/Communities/${id}/leave`, { method: 'POST' });
  },

  deleteCommunity: async (id: string): Promise<ApiResponse<any>> => {
      return request(`/api/Communities/${id}`, { method: 'DELETE' });
  }
};

export const commentService = {
    getCommentsByPostId: async (postId: string, page = 1): Promise<ApiResponse<CommentDto[]>> => {
        return request<CommentDto[]>(`/api/Comments/post/${postId}?page=${page}`);
    },

    addComment: async (data: CreateCommentDto): Promise<ApiResponse<CommentDto>> => {
        return request<CommentDto>('/api/Comments', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    updateComment: async (id: string, content: string): Promise<ApiResponse<CommentDto>> => {
        return request<CommentDto>(`/api/Comments/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ content })
        });
    },

    deleteComment: async (id: string): Promise<ApiResponse<object>> => {
        return request<object>(`/api/Comments/${id}`, {
            method: 'DELETE'
        });
    },

    voteComment: async (commentId: string, voteType: VoteType): Promise<ApiResponse<any>> => {
        return request(`/api/Comments/${commentId}/vote`, {
            method: 'POST',
            body: JSON.stringify({ voteType })
        });
    }
};

export const academicService = {
  // --- FACULTIES ---
  getFaculties: async (): Promise<ApiResponse<FacultyDto[]>> => {
    return request<FacultyDto[]>('/api/Faculties');
  },
  
  createFaculty: async (data: CreateFacultyDto): Promise<ApiResponse<FacultyDto>> => {
    return request<FacultyDto>('/api/Faculties', {
        method: 'POST',
        body: JSON.stringify(data)
    });
  },

  updateFaculty: async (id: string, data: UpdateFacultyDto): Promise<ApiResponse<FacultyDto>> => {
    return request<FacultyDto>(`/api/Faculties/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
  },

  deleteFaculty: async (id: string): Promise<ApiResponse<object>> => {
      return request<object>(`/api/Faculties/${id}`, { method: 'DELETE' });
  },
  
  // --- COURSES ---
  getCourses: async (): Promise<ApiResponse<CourseDto[]>> => {
    return request<CourseDto[]>('/api/Courses');
  },

  createCourse: async (data: CreateCourseDto): Promise<ApiResponse<CourseDto>> => {
      return request<CourseDto>('/api/Courses', {
          method: 'POST',
          body: JSON.stringify(data)
      });
  },

  updateCourse: async (id: string, data: UpdateCourseDto): Promise<ApiResponse<CourseDto>> => {
      return request<CourseDto>(`/api/Courses/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
      });
  },

  deleteCourse: async (id: string): Promise<ApiResponse<object>> => {
      return request<object>(`/api/Courses/${id}`, { method: 'DELETE' });
  },

  // --- STUDENT GROUPS ---
  getStudentGroups: async (): Promise<ApiResponse<StudentGroupDto[]>> => {
    return request<StudentGroupDto[]>('/api/StudentGroups');
  },

  createStudentGroup: async (data: CreateStudentGroupDto): Promise<ApiResponse<StudentGroupDto>> => {
      return request<StudentGroupDto>('/api/StudentGroups', {
          method: 'POST',
          body: JSON.stringify(data)
      });
  },

  updateStudentGroup: async (id: string, data: UpdateStudentGroupDto): Promise<ApiResponse<StudentGroupDto>> => {
      return request<StudentGroupDto>(`/api/StudentGroups/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
      });
  },

  deleteStudentGroup: async (id: string): Promise<ApiResponse<object>> => {
      return request<object>(`/api/StudentGroups/${id}`, { method: 'DELETE' });
  }
};
