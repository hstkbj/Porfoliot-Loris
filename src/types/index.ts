export type ProjectCategory =
  | 'Montage vidéo'
  | 'Motion Design'
  | 'Publicité'
  | 'Réseaux sociaux'
  | 'Clip musical'
  | 'Vidéo corporate'
  | 'YouTube'
  | 'Animation'
  | 'Branding'
  | 'Autre';

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  professional_name: string;
  job_title: string;
  bio: string;
  short_bio: string;
  photo_url: string;
  location: string;
  email: string;
  phone: string;
  years_experience: number;
  availability: boolean;
  hero_title: string;
  hero_description: string;
  created_at?: string;
  updated_at?: string;
}

export interface SiteSettings {
  id: string;
  site_name: string;
  site_description: string;
  logo_url: string;
  favicon_url?: string;
  seo_title: string;
  seo_description: string;
  primary_color: string;
  contact_email: string;
  contact_phone: string;
  location: string;
  copyright_text: string;
  budget_tiers?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface ProjectMedia {
  id: string;
  project_id: string;
  media_type: 'image' | 'video';
  media_url: string;
  thumbnail_url?: string;
  title?: string;
  display_order: number;
  created_at?: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  category: ProjectCategory;
  client: string;
  year: number;
  thumbnail_url: string;
  video_url: string;
  external_url?: string;
  tools: string[];
  featured: boolean;
  published: boolean;
  display_order: number;
  media?: ProjectMedia[];
  created_at?: string;
  updated_at?: string;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  image_url?: string;
  indicative_price?: string;
  indicative_duration?: string;
  active: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export type ServiceRequestStatus =
  | 'en_attente'
  | 'en_cours'
  | 'acceptee'
  | 'refusee'
  | 'terminee'
  | 'Nouvelle'
  | 'En cours'
  | 'Contacté'
  | 'Terminée'
  | 'Refusée';

export type RequestStatus = ServiceRequestStatus;

export interface ServiceRequest {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company?: string;
  service_id: string;
  budget?: string;
  desired_date?: string;
  description: string;
  reference_url?: string;
  attachment_url?: string;
  status: ServiceRequestStatus;
  created_at: string;
  updated_at?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  is_read: boolean;
  read?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Resume {
  id: string;
  file_name: string;
  file_url: string;
  file_size?: string;
  uploaded_at: string;
  updated_at?: string;
}

export interface SocialLink {
  id: string;
  platform: 'Instagram' | 'LinkedIn' | 'YouTube' | 'Vimeo' | 'Behance' | 'TikTok' | 'Facebook' | 'Twitter / X' | 'Autre';
  url: string;
  icon?: string;
  active: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: 'Logiciel' | 'Montage' | 'Motion Design' | 'Audio & Étalonnage' | 'Autre';
  level: number; // 1 to 100 or 1 to 5
  display_order: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardStats {
  totalProjects: number;
  publishedProjects: number;
  totalServices: number;
  newRequests: number;
  unreadMessages: number;
  totalRequests: number;
}
