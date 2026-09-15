import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Profile,
  SiteSettings,
  Project,
  Service,
  ServiceRequest,
  ContactMessage,
  Resume,
  SocialLink,
  Skill,
  DashboardStats,
} from '../types';
import {
  initialProfile,
  initialSiteSettings,
  initialProjects,
  initialServices,
  initialSkills,
  initialSocialLinks,
  initialResume,
  initialServiceRequests,
  initialContactMessages,
  DEFAULT_BUDGET_TIERS,
} from './initialData';

// LocalStorage Keys for preview/standalone mode
const STORAGE_KEYS = {
  PROFILE: 'roche_portfolio_profile',
  SETTINGS: 'roche_portfolio_settings',
  PROJECTS: 'roche_portfolio_projects',
  SERVICES: 'roche_portfolio_services',
  SKILLS: 'roche_portfolio_skills',
  SOCIALS: 'roche_portfolio_socials',
  RESUME: 'roche_portfolio_resume',
  REQUESTS: 'roche_portfolio_requests',
  MESSAGES: 'roche_portfolio_messages',
};

function getLocalItem<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    if (!data) return fallback;
    return JSON.parse(data) as T;
  } catch {
    return fallback;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage error:', e);
  }
}

function migrateServices(services: Service[]): Service[] {
  let changed = false;
  const migrated = services.map((s) => {
    let price = s.indicative_price || '';
    if (
      price.includes('€') ||
      price.toLowerCase().includes('/ jour') ||
      price.toLowerCase().includes('/jour') ||
      price.includes('300 000') ||
      price.includes('350 000') ||
      price.includes('400 000')
    ) {
      changed = true;
      if (price.includes('450') || price.includes('300 000')) price = 'À partir de 75 000 XOF';
      else if (price.includes('500') || price.includes('350 000')) price = 'À partir de 100 000 XOF';
      else if (price.includes('250') || price.includes('150 000')) price = 'À partir de 25 000 XOF';
      else if (price.includes('600') || price.includes('400 000')) price = 'Sur devis (dès 150 000 XOF)';
      else {
        price = price.replace(/\/ ?jour/gi, '').replace(/€/g, ' XOF').trim();
      }
      return { ...s, indicative_price: price };
    }
    return s;
  });
  if (changed) {
    setLocalItem(STORAGE_KEYS.SERVICES, migrated);
  }
  return migrated;
}

function migrateRequests(requests: ServiceRequest[]): ServiceRequest[] {
  let changed = false;
  const migrated = requests.map((r) => {
    let budget = r.budget || '';
    if (budget.includes('€') || budget.includes('3 000 000') || budget.includes('1 500 000') || budget.includes('750 000')) {
      changed = true;
      if (budget.includes('2 500') || budget.includes('1 500 000')) budget = '100 000 - 250 000 XOF';
      else if (budget.includes('1 500') || budget.includes('750 000')) budget = '50 000 - 100 000 XOF';
      else if (budget.includes('< 1 000') || budget.includes('< 300 000')) budget = 'Moins de 50 000 XOF';
      else if (budget.includes('1 000') || budget.includes('300 000')) budget = '50 000 - 100 000 XOF';
      else if (budget.includes('5 000')) budget = '250 000 - 500 000 XOF';
      else if (budget.includes('> 10 000') || budget.includes('> 3 000 000')) budget = 'Plus de 1 000 000 XOF';
      else budget = budget.replace(/€/g, ' XOF');
      return { ...r, budget };
    }
    return r;
  });
  if (changed) {
    setLocalItem(STORAGE_KEYS.REQUESTS, migrated);
  }
  return migrated;
}

export const api = {
  // 1. PROFILE
  async getProfile(): Promise<Profile> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('profiles').select('*').limit(1).single();
      if (!error && data) return data as Profile;
    }
    return getLocalItem<Profile>(STORAGE_KEYS.PROFILE, initialProfile);
  },

  async updateProfile(profile: Partial<Profile>): Promise<Profile> {
    if (isSupabaseConfigured && supabase) {
      const current = await this.getProfile();
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...profile, updated_at: new Date().toISOString() })
        .eq('id', current.id)
        .select()
        .single();
      if (!error && data) return data as Profile;
    }
    const current = getLocalItem<Profile>(STORAGE_KEYS.PROFILE, initialProfile);
    const updated = { ...current, ...profile, updated_at: new Date().toISOString() };
    setLocalItem(STORAGE_KEYS.PROFILE, updated);
    return updated;
  },

  // 2. SITE SETTINGS
  async getSiteSettings(): Promise<SiteSettings> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('site_settings').select('*').limit(1).single();
      if (!error && data) {
        return {
          ...initialSiteSettings,
          ...data,
          budget_tiers: data.budget_tiers?.length ? data.budget_tiers : DEFAULT_BUDGET_TIERS,
        } as SiteSettings;
      }
    }
    const settings = getLocalItem<SiteSettings>(STORAGE_KEYS.SETTINGS, initialSiteSettings);
    if (!settings.budget_tiers || !settings.budget_tiers.length || settings.budget_tiers.some((t) => t.includes('€') || t.includes('3 000 000'))) {
      settings.budget_tiers = DEFAULT_BUDGET_TIERS;
      setLocalItem(STORAGE_KEYS.SETTINGS, settings);
    }
    return settings;
  },

  async updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    if (isSupabaseConfigured && supabase) {
      const current = await this.getSiteSettings();
      const { data, error } = await supabase
        .from('site_settings')
        .update({ ...settings, updated_at: new Date().toISOString() })
        .eq('id', current.id)
        .select()
        .single();
      if (!error && data) return data as SiteSettings;
    }
    const current = getLocalItem<SiteSettings>(STORAGE_KEYS.SETTINGS, initialSiteSettings);
    const updated = { ...current, ...settings, updated_at: new Date().toISOString() };
    setLocalItem(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },

  // 3. PROJECTS
  async getProjects(includeUnpublished = false): Promise<Project[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('projects').select('*, media:project_media(*)').order('display_order', { ascending: true });
      if (!includeUnpublished) {
        query = query.eq('published', true);
      }
      const { data, error } = await query;
      if (!error && data) return data as Project[];
    }
    const list = getLocalItem<Project[]>(STORAGE_KEYS.PROJECTS, initialProjects);
    const sorted = [...list].sort((a, b) => a.display_order - b.display_order);
    return includeUnpublished ? sorted : sorted.filter((p) => p.published);
  },

  async getProjectBySlug(slug: string): Promise<Project | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('projects')
        .select('*, media:project_media(*)')
        .eq('slug', slug)
        .maybeSingle();
      if (!error && data) return data as Project;
    }
    const list = getLocalItem<Project[]>(STORAGE_KEYS.PROJECTS, initialProjects);
    return list.find((p) => p.slug === slug) || null;
  },

  async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    const newId = crypto.randomUUID ? crypto.randomUUID() : `proj_${Date.now()}`;
    const now = new Date().toISOString();
    const newProject: Project = {
      ...project,
      id: newId,
      created_at: now,
      updated_at: now,
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('projects').insert(newProject).select().single();
      if (!error && data) return data as Project;
    }

    const list = getLocalItem<Project[]>(STORAGE_KEYS.PROJECTS, initialProjects);
    const updated = [newProject, ...list];
    setLocalItem(STORAGE_KEYS.PROJECTS, updated);
    return newProject;
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const now = new Date().toISOString();
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('projects')
        .update({ ...updates, updated_at: now })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data as Project;
    }

    const list = getLocalItem<Project[]>(STORAGE_KEYS.PROJECTS, initialProjects);
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Projet introuvable');
    const updated = { ...list[index], ...updates, updated_at: now };
    list[index] = updated;
    setLocalItem(STORAGE_KEYS.PROJECTS, list);
    return updated;
  },

  async deleteProject(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('projects').delete().eq('id', id);
    }
    const list = getLocalItem<Project[]>(STORAGE_KEYS.PROJECTS, initialProjects);
    setLocalItem(STORAGE_KEYS.PROJECTS, list.filter((p) => p.id !== id));
  },

  // 4. SERVICES
  async getServices(includeInactive = false): Promise<Service[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('services').select('*').order('display_order', { ascending: true });
      if (!includeInactive) {
        query = query.eq('active', true);
      }
      const { data, error } = await query;
      if (!error && data) return data as Service[];
    }
    const rawList = getLocalItem<Service[]>(STORAGE_KEYS.SERVICES, initialServices);
    const list = migrateServices(rawList);
    const sorted = [...list].sort((a, b) => a.display_order - b.display_order);
    return includeInactive ? sorted : sorted.filter((s) => s.active);
  },

  async createService(service: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<Service> {
    const newId = crypto.randomUUID ? crypto.randomUUID() : `srv_${Date.now()}`;
    const now = new Date().toISOString();
    const newService: Service = { ...service, id: newId, created_at: now, updated_at: now };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('services').insert(newService).select().single();
      if (!error && data) return data as Service;
    }

    const list = getLocalItem<Service[]>(STORAGE_KEYS.SERVICES, initialServices);
    const updated = [...list, newService];
    setLocalItem(STORAGE_KEYS.SERVICES, updated);
    return newService;
  },

  async updateService(id: string, updates: Partial<Service>): Promise<Service> {
    const now = new Date().toISOString();
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('services')
        .update({ ...updates, updated_at: now })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data as Service;
    }

    const list = getLocalItem<Service[]>(STORAGE_KEYS.SERVICES, initialServices);
    const index = list.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Service introuvable');
    const updated = { ...list[index], ...updates, updated_at: now };
    list[index] = updated;
    setLocalItem(STORAGE_KEYS.SERVICES, list);
    return updated;
  },

  async deleteService(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('services').delete().eq('id', id);
    }
    const list = getLocalItem<Service[]>(STORAGE_KEYS.SERVICES, initialServices);
    setLocalItem(STORAGE_KEYS.SERVICES, list.filter((s) => s.id !== id));
  },

  // 5. SERVICE REQUESTS
  async getServiceRequests(): Promise<ServiceRequest[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data as ServiceRequest[];
    }
    const rawList = getLocalItem<ServiceRequest[]>(STORAGE_KEYS.REQUESTS, initialServiceRequests);
    const list = migrateRequests(rawList);
    return [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async createServiceRequest(request: Omit<ServiceRequest, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<ServiceRequest> {
    const newId = crypto.randomUUID ? crypto.randomUUID() : `req_${Date.now()}`;
    const now = new Date().toISOString();
    const newReq: ServiceRequest = {
      ...request,
      id: newId,
      status: 'Nouvelle',
      created_at: now,
      updated_at: now,
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('service_requests').insert(newReq).select().single();
      if (!error && data) return data as ServiceRequest;
    }

    const list = getLocalItem<ServiceRequest[]>(STORAGE_KEYS.REQUESTS, initialServiceRequests);
    setLocalItem(STORAGE_KEYS.REQUESTS, [newReq, ...list]);
    return newReq;
  },

  async updateServiceRequestStatus(id: string, status: ServiceRequest['status']): Promise<ServiceRequest> {
    const now = new Date().toISOString();
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('service_requests')
        .update({ status, updated_at: now })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data as ServiceRequest;
    }

    const list = getLocalItem<ServiceRequest[]>(STORAGE_KEYS.REQUESTS, initialServiceRequests);
    const index = list.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Demande introuvable');
    const updated = { ...list[index], status, updated_at: now };
    list[index] = updated;
    setLocalItem(STORAGE_KEYS.REQUESTS, list);
    return updated;
  },

  async deleteServiceRequest(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('service_requests').delete().eq('id', id);
    }
    const list = getLocalItem<ServiceRequest[]>(STORAGE_KEYS.REQUESTS, initialServiceRequests);
    setLocalItem(STORAGE_KEYS.REQUESTS, list.filter((r) => r.id !== id));
  },

  // 6. CONTACT MESSAGES
  async getContactMessages(): Promise<ContactMessage[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data as ContactMessage[];
    }
    const list = getLocalItem<ContactMessage[]>(STORAGE_KEYS.MESSAGES, initialContactMessages);
    return [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async createContactMessage(message: Omit<ContactMessage, 'id' | 'is_read' | 'created_at' | 'updated_at'>): Promise<ContactMessage> {
    const newId = crypto.randomUUID ? crypto.randomUUID() : `msg_${Date.now()}`;
    const now = new Date().toISOString();
    const newMsg: ContactMessage = {
      ...message,
      id: newId,
      is_read: false,
      created_at: now,
      updated_at: now,
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('contact_messages').insert(newMsg).select().single();
      if (!error && data) return data as ContactMessage;
    }

    const list = getLocalItem<ContactMessage[]>(STORAGE_KEYS.MESSAGES, initialContactMessages);
    setLocalItem(STORAGE_KEYS.MESSAGES, [newMsg, ...list]);
    return newMsg;
  },

  async toggleMessageReadStatus(id: string, is_read: boolean): Promise<ContactMessage> {
    const now = new Date().toISOString();
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('contact_messages')
        .update({ is_read, updated_at: now })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data as ContactMessage;
    }

    const list = getLocalItem<ContactMessage[]>(STORAGE_KEYS.MESSAGES, initialContactMessages);
    const index = list.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Message introuvable');
    const updated = { ...list[index], is_read, updated_at: now };
    list[index] = updated;
    setLocalItem(STORAGE_KEYS.MESSAGES, list);
    return updated;
  },

  async deleteContactMessage(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('contact_messages').delete().eq('id', id);
    }
    const list = getLocalItem<ContactMessage[]>(STORAGE_KEYS.MESSAGES, initialContactMessages);
    setLocalItem(STORAGE_KEYS.MESSAGES, list.filter((m) => m.id !== id));
  },

  // 7. RESUME
  async getResume(): Promise<Resume | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('resume').select('*').limit(1).maybeSingle();
      if (!error && data) return data as Resume;
    }
    return getLocalItem<Resume | null>(STORAGE_KEYS.RESUME, initialResume);
  },

  async updateResume(file: { file_name: string; file_url: string; file_size?: string }): Promise<Resume> {
    const now = new Date().toISOString();
    const updated: Resume = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'resume_main',
      file_name: file.file_name,
      file_url: file.file_url,
      file_size: file.file_size || '1.2 Mo',
      uploaded_at: now,
      updated_at: now,
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('resume').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      const { data, error } = await supabase.from('resume').insert(updated).select().single();
      if (!error && data) return data as Resume;
    }

    setLocalItem(STORAGE_KEYS.RESUME, updated);
    return updated;
  },

  async deleteResume(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('resume').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }
    try {
      localStorage.removeItem(STORAGE_KEYS.RESUME);
    } catch (e) {
      console.error(e);
    }
  },

  // 8. SOCIAL LINKS
  async getSocialLinks(includeInactive = false): Promise<SocialLink[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('social_links').select('*').order('display_order', { ascending: true });
      if (!includeInactive) query = query.eq('active', true);
      const { data, error } = await query;
      if (!error && data) return data as SocialLink[];
    }
    const list = getLocalItem<SocialLink[]>(STORAGE_KEYS.SOCIALS, initialSocialLinks);
    const sorted = [...list].sort((a, b) => a.display_order - b.display_order);
    return includeInactive ? sorted : sorted.filter((s) => s.active);
  },

  async updateSocialLinks(links: SocialLink[]): Promise<SocialLink[]> {
    setLocalItem(STORAGE_KEYS.SOCIALS, links);
    return links;
  },

  async createSocialLink(social: any): Promise<SocialLink> {
    const list = await this.getSocialLinks(true);
    const newId = crypto.randomUUID ? crypto.randomUUID() : `soc_${Date.now()}`;
    const newLink: SocialLink = {
      id: newId,
      platform: social.platform,
      url: social.url,
      active: social.active ?? true,
      display_order: social.display_order ?? list.length,
    };
    if (isSupabaseConfigured && supabase) {
      await supabase.from('social_links').insert(newLink);
    }
    const updated = [...list, newLink];
    setLocalItem(STORAGE_KEYS.SOCIALS, updated);
    return newLink;
  },

  async updateSocialLink(id: string, updates: Partial<SocialLink>): Promise<SocialLink> {
    const list = await this.getSocialLinks(true);
    const index = list.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Réseau introuvable');
    const updatedItem = { ...list[index], ...updates };
    list[index] = updatedItem;
    if (isSupabaseConfigured && supabase) {
      await supabase.from('social_links').update(updates).eq('id', id);
    }
    setLocalItem(STORAGE_KEYS.SOCIALS, list);
    return updatedItem;
  },

  async deleteSocialLink(id: string): Promise<void> {
    const list = await this.getSocialLinks(true);
    const filtered = list.filter((s) => s.id !== id);
    if (isSupabaseConfigured && supabase) {
      await supabase.from('social_links').delete().eq('id', id);
    }
    setLocalItem(STORAGE_KEYS.SOCIALS, filtered);
  },

  // 9. SKILLS
  async getSkills(includeInactive = false): Promise<Skill[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('skills').select('*').order('display_order', { ascending: true });
      if (!includeInactive) query = query.eq('active', true);
      const { data, error } = await query;
      if (!error && data) return data as Skill[];
    }
    const list = getLocalItem<Skill[]>(STORAGE_KEYS.SKILLS, initialSkills);
    const sorted = [...list].sort((a, b) => a.display_order - b.display_order);
    return includeInactive ? sorted : sorted.filter((s) => s.active);
  },

  async updateSkills(skills: Skill[]): Promise<Skill[]> {
    setLocalItem(STORAGE_KEYS.SKILLS, skills);
    return skills;
  },

  async createSkill(skill: any): Promise<Skill> {
    const list = await this.getSkills(true);
    const newId = crypto.randomUUID ? crypto.randomUUID() : `skl_${Date.now()}`;
    const newSkill: Skill = {
      id: newId,
      name: skill.name,
      category: skill.category || 'Logiciel',
      level: skill.level ?? 85,
      display_order: skill.display_order ?? list.length,
      active: skill.active ?? true,
    };
    if (isSupabaseConfigured && supabase) {
      await supabase.from('skills').insert(newSkill);
    }
    const updated = [...list, newSkill];
    setLocalItem(STORAGE_KEYS.SKILLS, updated);
    return newSkill;
  },

  async updateSkill(id: string, updates: Partial<Skill>): Promise<Skill> {
    const list = await this.getSkills(true);
    const index = list.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Compétence introuvable');
    const updated = { ...list[index], ...updates };
    list[index] = updated;
    if (isSupabaseConfigured && supabase) {
      await supabase.from('skills').update(updates).eq('id', id);
    }
    setLocalItem(STORAGE_KEYS.SKILLS, list);
    return updated;
  },

  async deleteSkill(id: string): Promise<void> {
    const list = await this.getSkills(true);
    const filtered = list.filter((s) => s.id !== id);
    if (isSupabaseConfigured && supabase) {
      await supabase.from('skills').delete().eq('id', id);
    }
    setLocalItem(STORAGE_KEYS.SKILLS, filtered);
  },

  async uploadResumeFile(file: File): Promise<Resume> {
    let fileUrl = URL.createObjectURL(file);
    if (isSupabaseConfigured && supabase) {
      try {
        const fileExt = file.name.split('.').pop();
        const filePath = `resumes/cv-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file);
        if (!uploadError) {
          const { data } = supabase.storage.from('documents').getPublicUrl(filePath);
          if (data?.publicUrl) {
            fileUrl = data.publicUrl;
          }
        }
      } catch (err) {
        console.warn('Storage upload fallback to object URL:', err);
      }
    }
    const fileSizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} Mo`;
    return this.updateResume({
      file_name: file.name,
      file_url: fileUrl,
      file_size: fileSizeStr,
    });
  },

  // 10. DASHBOARD STATS
  async getDashboardStats(): Promise<DashboardStats> {
    const [projects, services, requests, messages] = await Promise.all([
      this.getProjects(true),
      this.getServices(true),
      this.getServiceRequests(),
      this.getContactMessages(),
    ]);

    return {
      totalProjects: projects.length,
      publishedProjects: projects.filter((p) => p.published).length,
      totalServices: services.length,
      newRequests: requests.filter((r) => r.status === 'Nouvelle').length,
      unreadMessages: messages.filter((m) => !m.is_read).length,
      totalRequests: requests.length,
    };
  },
};
