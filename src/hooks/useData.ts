import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import {
  Profile,
  SiteSettings,
  Project,
  Service,
  ServiceRequest,
  ContactMessage,
  ServiceRequestStatus,
  SocialLink,
  Skill,
} from '../types';

export const QUERY_KEYS = {
  PROFILE: ['profile'],
  SETTINGS: ['site_settings'],
  PROJECTS: (all: boolean) => ['projects', { all }],
  PROJECT: (slug: string) => ['project', slug],
  SERVICES: (all: boolean) => ['services', { all }],
  REQUESTS: ['service_requests'],
  MESSAGES: ['contact_messages'],
  RESUME: ['resume'],
  SOCIALS: ['social_links'],
  SKILLS: ['skills'],
  STATS: ['dashboard_stats'],
};

// 1. Profile
export function useProfile() {
  return useQuery({
    queryKey: QUERY_KEYS.PROFILE,
    queryFn: () => api.getProfile(),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Profile>) => api.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROFILE });
    },
  });
}

// 2. Site Settings
export function useSiteSettings() {
  return useQuery({
    queryKey: QUERY_KEYS.SETTINGS,
    queryFn: () => api.getSiteSettings(),
  });
}

export function useUpdateSiteSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<SiteSettings>) => api.updateSiteSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SETTINGS });
    },
  });
}

// 3. Projects
export function useProjects(includeUnpublished = false) {
  return useQuery({
    queryKey: QUERY_KEYS.PROJECTS(includeUnpublished),
    queryFn: () => api.getProjects(includeUnpublished),
  });
}

export function useProject(slug: string) {
  return useQuery({
    queryKey: QUERY_KEYS.PROJECT(slug),
    queryFn: () => api.getProjectBySlug(slug),
    enabled: Boolean(slug),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => api.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Project> }) => api.updateProject(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
    },
  });
}

// 4. Services
export function useServices(includeInactive = false) {
  return useQuery({
    queryKey: QUERY_KEYS.SERVICES(includeInactive),
    queryFn: () => api.getServices(includeInactive),
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Service, 'id' | 'created_at' | 'updated_at'>) => api.createService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Service> }) => api.updateService(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
    },
  });
}

// 5. Service Requests
export function useServiceRequests() {
  return useQuery({
    queryKey: QUERY_KEYS.REQUESTS,
    queryFn: () => api.getServiceRequests(),
  });
}

export function useCreateServiceRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ServiceRequest, 'id' | 'status' | 'created_at' | 'updated_at'>) =>
      api.createServiceRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REQUESTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
    },
  });
}

export function useUpdateServiceRequestStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ServiceRequestStatus }) =>
      api.updateServiceRequestStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REQUESTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
    },
  });
}

export function useDeleteServiceRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteServiceRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REQUESTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
    },
  });
}

// 6. Contact Messages
export function useContactMessages() {
  return useQuery({
    queryKey: QUERY_KEYS.MESSAGES,
    queryFn: () => api.getContactMessages(),
  });
}

export function useCreateContactMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ContactMessage, 'id' | 'is_read' | 'created_at' | 'updated_at'>) =>
      api.createContactMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MESSAGES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
    },
  });
}

export function useToggleMessageReadStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_read }: { id: string; is_read?: boolean; read?: boolean }) =>
      api.toggleMessageReadStatus(id, is_read ?? false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MESSAGES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
    },
  });
}

export const useMarkMessageRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, read }: { id: string; read: boolean }) =>
      api.toggleMessageReadStatus(id, read),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MESSAGES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
    },
  });
};

export function useDeleteContactMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteContactMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MESSAGES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS });
    },
  });
}

// 7. Resume
export function useResume() {
  return useQuery({
    queryKey: QUERY_KEYS.RESUME,
    queryFn: () => api.getResume(),
  });
}

export function useUpdateResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: { file_name: string; file_url: string; file_size?: string }) =>
      api.updateResume(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESUME });
    },
  });
}

export function useUploadResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => api.uploadResumeFile(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESUME });
    },
  });
}

export function useDeleteResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.deleteResume(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESUME });
    },
  });
}

// 8. Social Links
export function useSocialLinks(includeInactive = false) {
  return useQuery({
    queryKey: QUERY_KEYS.SOCIALS,
    queryFn: () => api.getSocialLinks(includeInactive),
  });
}

export function useUpdateSocialLinks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (links: SocialLink[]) => api.updateSocialLinks(links),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SOCIALS });
    },
  });
}

export function useCreateSocialLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.createSocialLink(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SOCIALS });
    },
  });
}

export function useUpdateSocialLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, social }: { id: string; social: Partial<SocialLink> }) =>
      api.updateSocialLink(id, social),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SOCIALS });
    },
  });
}

export function useDeleteSocialLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteSocialLink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SOCIALS });
    },
  });
}

// 9. Skills
export function useSkills(includeInactive = false) {
  return useQuery({
    queryKey: QUERY_KEYS.SKILLS,
    queryFn: () => api.getSkills(includeInactive),
  });
}

export function useUpdateSkills() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (skills: Skill[]) => api.updateSkills(skills),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SKILLS });
    },
  });
}

export function useCreateSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.createSkill(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SKILLS });
    },
  });
}

export function useUpdateSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, skill }: { id: string; skill: Partial<Skill> }) =>
      api.updateSkill(id, skill),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SKILLS });
    },
  });
}

export function useDeleteSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteSkill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SKILLS });
    },
  });
}

// 10. Dashboard Stats
export function useDashboardStats() {
  return useQuery({
    queryKey: QUERY_KEYS.STATS,
    queryFn: () => api.getDashboardStats(),
    refetchInterval: 10000,
  });
}
