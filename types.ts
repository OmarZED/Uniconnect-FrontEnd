export enum UserRole {
  STUDENT = 0,
  TEACHER = 1,
  DEAN = 2,
  DEPARTMENT_MANAGER = 3
}

export const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case UserRole.STUDENT: return 'Student';
    case UserRole.TEACHER: return 'Teacher';
    case UserRole.DEPARTMENT_MANAGER: return 'Department Manager';
    case UserRole.DEAN: return 'Dean';
    default: return 'Unknown';
  }
};

export interface UserDto {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  role: UserRole;

  facultyId?: string;
  facultyName?: string;
  courseId?: string;
  courseName?: string;
  studentGroupId?: string;
  studentGroupName?: string;

  profilePictureUrl?: string;
  bio?: string;
  createdAt?: string;
  lastLogin?: string;
  isActive?: boolean;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponseDto {
  token: string;
  user: UserDto;
}

export interface UpdateProfileDto {
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  bio?: string;
  facultyId?: string;
  courseId?: string;
  studentGroupId?: string;
}

export interface FacultyDto {
  id: string;
  name: string;
  code: string;
  description?: string;
  deanId?: string;
  deanName?: string;
  createdAt?: string;
  isActive?: boolean;
}

export interface CreateFacultyDto {
  name: string;
  code: string;
  description?: string;
  deanId?: string;
}

export interface CourseDto {
  id: string;
  name: string;
  year: number;
  code?: string;
  facultyId?: string;
  facultyName?: string;
  createdAt?: string;
  isActive?: boolean;
}

export interface CreateCourseDto {
  name: string;
  year: number;
  code?: string;
  facultyId: string;
}

export interface StudentGroupDto {
  id: string;
  name: string;
  code: string;
  description?: string;
  courseId?: string;
  courseName?: string;
  facultyId?: string;
  facultyName?: string;
  createdAt?: string;
  isActive?: boolean;
  studentCount?: number;
}

export interface CreateStudentGroupDto {
  name: string;
  code: string;
  description?: string;
  courseId: string;
}

export interface UpdateFacultyDto {
  name?: string;
  code?: string;
  description?: string;
  deanId?: string;
}

export interface UpdateCourseDto {
  name?: string;
  year?: number;
  code?: string;
  facultyId?: string;
}

export interface UpdateStudentGroupDto {
  name?: string;
  code?: string;
  description?: string;
  courseId?: string;
}

export enum CommunityType {
  Faculty = 0,
  Course = 1,
  Group = 2,
  Department = 3
}

export enum CommunityRole {
  Member = 0,
  Moderator = 1,
  Admin = 2
}

export interface CommunityDto {
  id: string;
  name: string;
  description?: string;
  type: CommunityType | number;
  ownerId?: string;
  facultyId?: string;
  facultyName?: string;
  courseId?: string;
  courseName?: string;
  studentGroupId?: string;
  studentGroupName?: string;
  memberCount?: number;
  postCount?: number;
  allowPosts?: boolean;
  autoJoin?: boolean;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  currentUserRole?: CommunityRole | null;
  isCurrentUserMember?: boolean;
}

export interface CreateDepartmentCommunityDto {
  name: string;
  description?: string;
  allowPosts: boolean;
  autoJoin: boolean;
}

export interface UpdateCommunityDto {
  name?: string;
  description?: string;
  allowPosts?: boolean;
  autoJoin?: boolean;
}

export interface CommunityMemberDto {
  id: string;
  communityId: string;
  userId: string;
  userEmail: string;
  userFirstName: string;
  userLastName: string;
  userFullName: string;
  profilePictureUrl?: string;
  role: CommunityRole;
  joinedAt: string;
  isActive: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

export enum ReactionType {
  Like = 0,
  Love = 1,
  Wow = 2,
  Laugh = 3,
  Sad = 4,
  Angry = 5
}

export enum VoteType {
  Downvote = -1,
  Upvote = 1
}

export interface Post {
  id: string;
  title: string;
  content: string;
  communityId?: string;
  communityName?: string;
  authorId?: string;
  authorName?: string;
  authorProfilePicture?: string;
  visibility?: number;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  likeCount: number;
  loveCount: number;
  wowCount: number;
  laughCount: number;
  sadCount: number;
  angryCount: number;
  totalReactions: number;
  commentCount: number;
  shareCount: number;
  currentUserReaction?: ReactionType | null;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface CreatePostDto {
  title: string;
  content: string;
  communityId: string;
  visibility?: number;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  visibility?: number;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
}

export interface CommentDto {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorProfilePicture?: string;
  parentCommentId?: string | null;
  replies?: CommentDto[];
  upvoteCount?: number;
  downvoteCount?: number;
  score?: number;
  currentUserVote?: VoteType | null;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface CreateCommentDto {
  content: string;
  postId: string;
  parentCommentId?: string;
}

export interface UpdateCommentDto {
  content: string;
}

export interface AddCommentVoteDto {
  voteType: VoteType;
}

export type NotificationType = 'like' | 'comment' | 'follow' | 'system' | 'group_invite';

export interface Notification {
  id: string;
  recipientId: string;
  actorId?: string;
  actorName?: string;
  actorAvatar?: string;
  type: NotificationType;
  message: string;
  referenceId?: string;
  isRead: boolean;
  timestamp: string;
}
