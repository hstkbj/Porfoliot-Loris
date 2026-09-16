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

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch (_) {}
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function isValidUUID(id: string | null | undefined): boolean {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export interface TableHealthStatus {
  name: string;
  status: 'ok' | 'warning' | 'error';
  message: string;
  rowCount?: number;
}

export interface DatabaseHealthReport {
  supabaseConfigured: boolean;
  supabaseUrl?: string;
  overallStatus: 'healthy' | 'warning' | 'error' | 'local_only';
  latencyMs: number;
  tables: TableHealthStatus[];
  storageBuckets: { name: string; status: 'ok' | 'warning' | 'error'; message: string }[];
  recommendations: string[];
}

export const api = {
  // 1. PROFILE
  async getProfile(): Promise<Profile> {
    const local = getLocalItem<Profile>(STORAGE_KEYS.PROFILE, initialProfile);
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('profiles').select('*').limit(1).single();
        if (!error && data) {
          const localUpdated = local.updated_at ? new Date(local.updated_at).getTime() : 0;
          const remoteUpdated = data.updated_at ? new Date(data.updated_at).getTime() : 0;
          if (localUpdated > remoteUpdated) {
            return local;
          }
          setLocalItem(STORAGE_KEYS.PROFILE, data);
          return data as Profile;
        }
      } catch (err) {
        console.warn('Supabase getProfile error:', err);
      }
    }
    return local;
  },

  async updateProfile(profile: Partial<Profile>): Promise<Profile> {
    const current = await this.getProfile();
    const updatedLocal = { ...current, ...profile, updated_at: new Date().toISOString() };
    setLocalItem(STORAGE_KEYS.PROFILE, updatedLocal);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update({ ...profile, updated_at: updatedLocal.updated_at })
          .eq('id', current.id)
          .select()
          .single();
        if (!error && data) {
          setLocalItem(STORAGE_KEYS.PROFILE, data);
          return data as Profile;
        }
        if (error) {
          console.warn('Supabase updateProfile error (changes kept in local storage):', error);
        }
      } catch (err) {
        console.warn('Supabase updateProfile network error:', err);
      }
    }

    return updatedLocal;
  },

  // 2. SITE SETTINGS
  async getSiteSettings(): Promise<SiteSettings> {
    const local = getLocalItem<SiteSettings>(STORAGE_KEYS.SETTINGS, initialSiteSettings);
    if (!local.budget_tiers || !local.budget_tiers.length || local.budget_tiers.some((t) => t.includes('€') || t.includes('3 000 000'))) {
      local.budget_tiers = DEFAULT_BUDGET_TIERS;
      setLocalItem(STORAGE_KEYS.SETTINGS, local);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('site_settings').select('*').limit(1).single();
        if (!error && data) {
          const localUpdated = local.updated_at ? new Date(local.updated_at).getTime() : 0;
          const remoteUpdated = data.updated_at ? new Date(data.updated_at).getTime() : 0;
          if (localUpdated > remoteUpdated) {
            return local;
          }
          const merged: SiteSettings = {
            ...initialSiteSettings,
            ...data,
            budget_tiers: data.budget_tiers?.length ? data.budget_tiers : DEFAULT_BUDGET_TIERS,
          };
          setLocalItem(STORAGE_KEYS.SETTINGS, merged);
          return merged;
        }
      } catch (err) {
        console.warn('Supabase getSiteSettings error:', err);
      }
    }
    return local;
  },

  async updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const current = await this.getSiteSettings();
    const updatedLocal = { ...current, ...settings, updated_at: new Date().toISOString() };
    setLocalItem(STORAGE_KEYS.SETTINGS, updatedLocal);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .update({ ...settings, updated_at: updatedLocal.updated_at })
          .eq('id', current.id)
          .select()
          .single();
        if (!error && data) {
          const merged: SiteSettings = {
            ...initialSiteSettings,
            ...data,
            budget_tiers: data.budget_tiers?.length ? data.budget_tiers : DEFAULT_BUDGET_TIERS,
          };
          setLocalItem(STORAGE_KEYS.SETTINGS, merged);
          return merged;
        }
        if (error) {
          console.warn('Supabase updateSiteSettings error (changes kept in local storage):', error);
        }
      } catch (err) {
        console.warn('Supabase updateSiteSettings network error:', err);
      }
    }

    return updatedLocal;
  },

  // 3. PROJECTS
  async getProjects(includeUnpublished = false): Promise<Project[]> {
    const local = getLocalItem<Project[]>(STORAGE_KEYS.PROJECTS, initialProjects);
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('projects').select('*, media:project_media(*)').order('display_order', { ascending: true });
        if (!includeUnpublished) {
          query = query.eq('published', true);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          setLocalItem(STORAGE_KEYS.PROJECTS, data as Project[]);
          return data as Project[];
        }
      } catch (err) {
        console.warn('Supabase getProjects error:', err);
      }
    }
    const sorted = [...local].sort((a, b) => a.display_order - b.display_order);
    return includeUnpublished ? sorted : sorted.filter((p) => p.published);
  },

  async getProjectBySlug(slug: string): Promise<Project | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*, media:project_media(*)')
          .eq('slug', slug)
          .maybeSingle();
        if (!error && data) return data as Project;
      } catch (err) {
        console.warn('Supabase getProjectBySlug error:', err);
      }
    }
    const list = getLocalItem<Project[]>(STORAGE_KEYS.PROJECTS, initialProjects);
    return list.find((p) => p.slug === slug) || null;
  },

  async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    const newId = generateUUID();
    const now = new Date().toISOString();
    const { media, ...projectData } = project as any;
    const newProject: Project = {
      ...project,
      id: newId,
      created_at: now,
      updated_at: now,
    };

    const list = getLocalItem<Project[]>(STORAGE_KEYS.PROJECTS, initialProjects);
    const updated = [newProject, ...list];
    setLocalItem(STORAGE_KEYS.PROJECTS, updated);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('projects')
          .insert({ ...projectData, id: newId, created_at: now, updated_at: now });
        if (error) {
          console.warn('Supabase createProject error:', error);
        } else if (media && Array.isArray(media) && media.length > 0) {
          const mediaRows = media.map((m: any, idx: number) => ({
            id: isValidUUID(m.id) ? m.id : generateUUID(),
            project_id: newId,
            media_type: m.media_type || 'image',
            media_url: m.media_url,
            thumbnail_url: m.thumbnail_url || null,
            title: m.title || null,
            display_order: m.display_order ?? idx + 1,
            created_at: now,
          }));
          await supabase.from('project_media').insert(mediaRows);
        }
      } catch (err) {
        console.warn('Supabase createProject network error:', err);
      }
    }

    return newProject;
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const now = new Date().toISOString();
    const list = getLocalItem<Project[]>(STORAGE_KEYS.PROJECTS, initialProjects);
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Projet introuvable');
    const updated = { ...list[index], ...updates, updated_at: now };
    list[index] = updated;
    setLocalItem(STORAGE_KEYS.PROJECTS, list);

    if (isSupabaseConfigured && supabase) {
      try {
        const { media, ...projectData } = updates as any;
        if (Object.keys(projectData).length > 0) {
          const { error } = await supabase
            .from('projects')
            .update({ ...projectData, updated_at: now })
            .eq('id', id);
          if (error) console.warn('Supabase updateProject error:', error);
        }

        if (media && Array.isArray(media)) {
          await supabase.from('project_media').delete().eq('project_id', id);
          if (media.length > 0) {
            const mediaRows = media.map((m: any, idx: number) => ({
              id: isValidUUID(m.id) ? m.id : generateUUID(),
              project_id: id,
              media_type: m.media_type || 'image',
              media_url: m.media_url,
              thumbnail_url: m.thumbnail_url || null,
              title: m.title || null,
              display_order: m.display_order ?? idx + 1,
              created_at: now,
            }));
            await supabase.from('project_media').insert(mediaRows);
          }
        }
      } catch (err) {
        console.warn('Supabase updateProject network error:', err);
      }
    }

    return updated;
  },

  async deleteProject(id: string): Promise<void> {
    const list = getLocalItem<Project[]>(STORAGE_KEYS.PROJECTS, initialProjects);
    setLocalItem(STORAGE_KEYS.PROJECTS, list.filter((p) => p.id !== id));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('project_media').delete().eq('project_id', id);
        await supabase.from('projects').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteProject error:', err);
      }
    }
  },

  // 4. SERVICES
  async getServices(includeInactive = false): Promise<Service[]> {
    const rawList = getLocalItem<Service[]>(STORAGE_KEYS.SERVICES, initialServices);
    const list = migrateServices(rawList);

    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('services').select('*').order('display_order', { ascending: true });
        if (!includeInactive) {
          query = query.eq('active', true);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          setLocalItem(STORAGE_KEYS.SERVICES, data as Service[]);
          return data as Service[];
        }
      } catch (err) {
        console.warn('Supabase getServices error:', err);
      }
    }

    const sorted = [...list].sort((a, b) => a.display_order - b.display_order);
    return includeInactive ? sorted : sorted.filter((s) => s.active);
  },

  async createService(service: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<Service> {
    const newId = generateUUID();
    const now = new Date().toISOString();
    const newService: Service = { ...service, id: newId, created_at: now, updated_at: now };

    const list = getLocalItem<Service[]>(STORAGE_KEYS.SERVICES, initialServices);
    const updated = [...list, newService];
    setLocalItem(STORAGE_KEYS.SERVICES, updated);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('services').insert(newService);
        if (error) console.warn('Supabase createService error:', error);
      } catch (err) {
        console.warn('Supabase createService network error:', err);
      }
    }

    return newService;
  },

  async updateService(id: string, updates: Partial<Service>): Promise<Service> {
    const now = new Date().toISOString();
    const list = getLocalItem<Service[]>(STORAGE_KEYS.SERVICES, initialServices);
    const index = list.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Service introuvable');
    const updated = { ...list[index], ...updates, updated_at: now };
    list[index] = updated;
    setLocalItem(STORAGE_KEYS.SERVICES, list);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('services')
          .update({ ...updates, updated_at: now })
          .eq('id', id);
        if (error) console.warn('Supabase updateService error:', error);
      } catch (err) {
        console.warn('Supabase updateService network error:', err);
      }
    }

    return updated;
  },

  async deleteService(id: string): Promise<void> {
    const list = getLocalItem<Service[]>(STORAGE_KEYS.SERVICES, initialServices);
    setLocalItem(STORAGE_KEYS.SERVICES, list.filter((s) => s.id !== id));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('services').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteService error:', err);
      }
    }
  },

  // 5. SERVICE REQUESTS
  async getServiceRequests(): Promise<ServiceRequest[]> {
    const rawList = getLocalItem<ServiceRequest[]>(STORAGE_KEYS.REQUESTS, initialServiceRequests);
    const list = migrateRequests(rawList);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('service_requests')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          setLocalItem(STORAGE_KEYS.REQUESTS, data as ServiceRequest[]);
          return data as ServiceRequest[];
        }
      } catch (err) {
        console.warn('Supabase getServiceRequests error:', err);
      }
    }

    return [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async createServiceRequest(request: Omit<ServiceRequest, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<ServiceRequest> {
    const newId = generateUUID();
    const now = new Date().toISOString();
    const sanitizedServiceId = request.service_id && isValidUUID(request.service_id) ? request.service_id : null;
    const newReq: ServiceRequest = {
      ...request,
      id: newId,
      service_id: sanitizedServiceId as any,
      status: 'Nouvelle',
      created_at: now,
      updated_at: now,
    };

    const list = getLocalItem<ServiceRequest[]>(STORAGE_KEYS.REQUESTS, initialServiceRequests);
    setLocalItem(STORAGE_KEYS.REQUESTS, [newReq, ...list]);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('service_requests').insert({
          id: newId,
          full_name: newReq.full_name,
          email: newReq.email,
          phone: newReq.phone,
          company: newReq.company || null,
          service_id: sanitizedServiceId,
          budget: newReq.budget || null,
          desired_date: newReq.desired_date || null,
          description: newReq.description,
          reference_url: newReq.reference_url || null,
          attachment_url: newReq.attachment_url || null,
          status: 'Nouvelle',
          created_at: now,
          updated_at: now,
        });
        if (error) console.warn('Supabase createServiceRequest error:', error);
      } catch (err) {
        console.warn('Supabase createServiceRequest network error:', err);
      }
    }

    return newReq;
  },

  async updateServiceRequestStatus(id: string, status: ServiceRequest['status']): Promise<ServiceRequest> {
    const now = new Date().toISOString();
    const list = getLocalItem<ServiceRequest[]>(STORAGE_KEYS.REQUESTS, initialServiceRequests);
    const index = list.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Demande introuvable');
    const updated = { ...list[index], status, updated_at: now };
    list[index] = updated;
    setLocalItem(STORAGE_KEYS.REQUESTS, list);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('service_requests')
          .update({ status, updated_at: now })
          .eq('id', id);
        if (error) console.warn('Supabase updateServiceRequestStatus error:', error);
      } catch (err) {
        console.warn('Supabase updateServiceRequestStatus network error:', err);
      }
    }

    return updated;
  },

  async deleteServiceRequest(id: string): Promise<void> {
    const list = getLocalItem<ServiceRequest[]>(STORAGE_KEYS.REQUESTS, initialServiceRequests);
    setLocalItem(STORAGE_KEYS.REQUESTS, list.filter((r) => r.id !== id));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('service_requests').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteServiceRequest error:', err);
      }
    }
  },

  // 6. CONTACT MESSAGES
  async getContactMessages(): Promise<ContactMessage[]> {
    const list = getLocalItem<ContactMessage[]>(STORAGE_KEYS.MESSAGES, initialContactMessages);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('contact_messages')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          setLocalItem(STORAGE_KEYS.MESSAGES, data as ContactMessage[]);
          return data as ContactMessage[];
        }
      } catch (err) {
        console.warn('Supabase getContactMessages error:', err);
      }
    }

    return [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async createContactMessage(message: Omit<ContactMessage, 'id' | 'is_read' | 'created_at' | 'updated_at'>): Promise<ContactMessage> {
    const newId = generateUUID();
    const now = new Date().toISOString();
    const newMsg: ContactMessage = {
      ...message,
      id: newId,
      is_read: false,
      created_at: now,
      updated_at: now,
    };

    const list = getLocalItem<ContactMessage[]>(STORAGE_KEYS.MESSAGES, initialContactMessages);
    setLocalItem(STORAGE_KEYS.MESSAGES, [newMsg, ...list]);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('contact_messages').insert({
          id: newId,
          name: newMsg.name,
          email: newMsg.email,
          phone: newMsg.phone || null,
          subject: newMsg.subject || null,
          message: newMsg.message,
          is_read: false,
          created_at: now,
          updated_at: now,
        });
        if (error) console.warn('Supabase createContactMessage error:', error);
      } catch (err) {
        console.warn('Supabase createContactMessage network error:', err);
      }
    }

    return newMsg;
  },

  async toggleMessageReadStatus(id: string, is_read: boolean): Promise<ContactMessage> {
    const now = new Date().toISOString();
    const list = getLocalItem<ContactMessage[]>(STORAGE_KEYS.MESSAGES, initialContactMessages);
    const index = list.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Message introuvable');
    const updated = { ...list[index], is_read, updated_at: now };
    list[index] = updated;
    setLocalItem(STORAGE_KEYS.MESSAGES, list);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('contact_messages')
          .update({ is_read, updated_at: now })
          .eq('id', id);
        if (error) console.warn('Supabase toggleMessageReadStatus error:', error);
      } catch (err) {
        console.warn('Supabase toggleMessageReadStatus network error:', err);
      }
    }

    return updated;
  },

  async deleteContactMessage(id: string): Promise<void> {
    const list = getLocalItem<ContactMessage[]>(STORAGE_KEYS.MESSAGES, initialContactMessages);
    setLocalItem(STORAGE_KEYS.MESSAGES, list.filter((m) => m.id !== id));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('contact_messages').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteContactMessage error:', err);
      }
    }
  },

  // 7. RESUME
  async getResume(): Promise<Resume | null> {
    const local = getLocalItem<Resume | null>(STORAGE_KEYS.RESUME, initialResume);
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('resume').select('*').limit(1).maybeSingle();
        if (!error && data) {
          const merged: Resume = { ...local, ...data };
          setLocalItem(STORAGE_KEYS.RESUME, merged);
          return merged;
        }
      } catch (err) {
        console.warn('Supabase getResume error:', err);
      }
    }
    return local;
  },

  async updateResume(file: { file_name: string; file_url: string; file_size?: string }): Promise<Resume> {
    const now = new Date().toISOString();
    const resumeId = generateUUID();
    const updated: Resume = {
      id: resumeId,
      file_name: file.file_name,
      file_url: file.file_url,
      file_size: file.file_size || '1.2 Mo',
      uploaded_at: now,
      updated_at: now,
    };

    setLocalItem(STORAGE_KEYS.RESUME, updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('resume').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        const { error } = await supabase.from('resume').insert({
          id: resumeId,
          file_name: file.file_name,
          file_url: file.file_url,
          uploaded_at: now,
          updated_at: now,
        });
        if (error) console.warn('Supabase updateResume error:', error);
      } catch (err) {
        console.warn('Supabase updateResume network error:', err);
      }
    }

    return updated;
  },

  async deleteResume(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('resume').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (err) {
        console.warn('Supabase deleteResume error:', err);
      }
    }
    try {
      localStorage.removeItem(STORAGE_KEYS.RESUME);
    } catch (e) {
      console.error(e);
    }
  },

  // 8. SOCIAL LINKS
  async getSocialLinks(includeInactive = false): Promise<SocialLink[]> {
    const list = getLocalItem<SocialLink[]>(STORAGE_KEYS.SOCIALS, initialSocialLinks);

    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('social_links').select('*').order('display_order', { ascending: true });
        if (!includeInactive) query = query.eq('active', true);
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          setLocalItem(STORAGE_KEYS.SOCIALS, data as SocialLink[]);
          return data as SocialLink[];
        }
      } catch (err) {
        console.warn('Supabase getSocialLinks error:', err);
      }
    }

    const sorted = [...list].sort((a, b) => a.display_order - b.display_order);
    return includeInactive ? sorted : sorted.filter((s) => s.active);
  },

  async updateSocialLinks(links: SocialLink[]): Promise<SocialLink[]> {
    setLocalItem(STORAGE_KEYS.SOCIALS, links);
    return links;
  },

  async createSocialLink(social: any): Promise<SocialLink> {
    const list = await this.getSocialLinks(true);
    const newId = generateUUID();
    const newLink: SocialLink = {
      id: newId,
      platform: social.platform,
      url: social.url,
      active: social.active ?? true,
      display_order: social.display_order ?? list.length,
    };

    const updated = [...list, newLink];
    setLocalItem(STORAGE_KEYS.SOCIALS, updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('social_links').insert(newLink);
      } catch (err) {
        console.warn('Supabase createSocialLink error:', err);
      }
    }

    return newLink;
  },

  async updateSocialLink(id: string, updates: Partial<SocialLink>): Promise<SocialLink> {
    const list = await this.getSocialLinks(true);
    const index = list.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Réseau introuvable');
    const updatedItem = { ...list[index], ...updates };
    list[index] = updatedItem;
    setLocalItem(STORAGE_KEYS.SOCIALS, list);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('social_links').update(updates).eq('id', id);
      } catch (err) {
        console.warn('Supabase updateSocialLink error:', err);
      }
    }

    return updatedItem;
  },

  async deleteSocialLink(id: string): Promise<void> {
    const list = await this.getSocialLinks(true);
    const filtered = list.filter((s) => s.id !== id);
    setLocalItem(STORAGE_KEYS.SOCIALS, filtered);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('social_links').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteSocialLink error:', err);
      }
    }
  },

  // 9. SKILLS
  async getSkills(includeInactive = false): Promise<Skill[]> {
    const list = getLocalItem<Skill[]>(STORAGE_KEYS.SKILLS, initialSkills);

    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('skills').select('*').order('display_order', { ascending: true });
        if (!includeInactive) query = query.eq('active', true);
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          setLocalItem(STORAGE_KEYS.SKILLS, data as Skill[]);
          return data as Skill[];
        }
      } catch (err) {
        console.warn('Supabase getSkills error:', err);
      }
    }

    const sorted = [...list].sort((a, b) => a.display_order - b.display_order);
    return includeInactive ? sorted : sorted.filter((s) => s.active);
  },

  async updateSkills(skills: Skill[]): Promise<Skill[]> {
    setLocalItem(STORAGE_KEYS.SKILLS, skills);
    return skills;
  },

  async createSkill(skill: any): Promise<Skill> {
    const list = await this.getSkills(true);
    const newId = generateUUID();
    const newSkill: Skill = {
      id: newId,
      name: skill.name,
      category: skill.category || 'Logiciel',
      level: skill.level ?? 85,
      display_order: skill.display_order ?? list.length,
      active: skill.active ?? true,
    };

    const updated = [...list, newSkill];
    setLocalItem(STORAGE_KEYS.SKILLS, updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('skills').insert(newSkill);
      } catch (err) {
        console.warn('Supabase createSkill error:', err);
      }
    }

    return newSkill;
  },

  async updateSkill(id: string, updates: Partial<Skill>): Promise<Skill> {
    const list = await this.getSkills(true);
    const index = list.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Compétence introuvable');
    const updated = { ...list[index], ...updates };
    list[index] = updated;
    setLocalItem(STORAGE_KEYS.SKILLS, list);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('skills').update(updates).eq('id', id);
      } catch (err) {
        console.warn('Supabase updateSkill error:', err);
      }
    }

    return updated;
  },

  async deleteSkill(id: string): Promise<void> {
    const list = await this.getSkills(true);
    const filtered = list.filter((s) => s.id !== id);
    setLocalItem(STORAGE_KEYS.SKILLS, filtered);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('skills').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteSkill error:', err);
      }
    }
  },

  async uploadResumeFile(file: File): Promise<Resume> {
    let fileUrl = URL.createObjectURL(file);
    if (isSupabaseConfigured && supabase) {
      const fileExt = file.name.split('.').pop();
      const filePath = `cv-${Date.now()}.${fileExt}`;
      try {
        // Try 'resume' bucket
        const { error: uploadError } = await supabase.storage.from('resume').upload(filePath, file, { upsert: true });
        if (!uploadError) {
          const { data } = supabase.storage.from('resume').getPublicUrl(filePath);
          if (data?.publicUrl) fileUrl = data.publicUrl;
        } else {
          // Fallback to 'documents' or 'profile'
          const { error: docError } = await supabase.storage.from('documents').upload(filePath, file, { upsert: true });
          if (!docError) {
            const { data } = supabase.storage.from('documents').getPublicUrl(filePath);
            if (data?.publicUrl) fileUrl = data.publicUrl;
          }
        }
      } catch (err) {
        console.warn('Storage upload exception:', err);
      }
    }
    const fileSizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} Mo`;
    return this.updateResume({
      file_name: file.name,
      file_url: fileUrl,
      file_size: fileSizeStr,
    });
  },

  // 10. DIAGNOSTIC & SANTÉ BASE DE DONNÉES
  async checkDatabaseHealth(): Promise<DatabaseHealthReport> {
    const startTime = Date.now();
    const env = (import.meta as any).env || {};
    const supabaseUrl = env.VITE_SUPABASE_URL || '';

    if (!isSupabaseConfigured || !supabase) {
      return {
        supabaseConfigured: false,
        supabaseUrl,
        overallStatus: 'local_only',
        latencyMs: 0,
        tables: [],
        storageBuckets: [],
        recommendations: [
          'Supabase n’est pas configuré ou les variables VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont manquantes.',
          'Le portfolio fonctionne en mode autonome 100% opérationnel avec persistance locale.',
        ],
      };
    }

    const tableNames = [
      'profiles',
      'site_settings',
      'projects',
      'project_media',
      'services',
      'service_requests',
      'contact_messages',
      'resume',
      'social_links',
      'skills',
    ];

    const tables: TableHealthStatus[] = [];
    const recommendations: string[] = [];

    for (const name of tableNames) {
      try {
        const { data, error, count } = await supabase
          .from(name)
          .select('*', { count: 'exact', head: false })
          .limit(1);

        if (error) {
          tables.push({
            name,
            status: 'error',
            message: error.message || 'Erreur inconnue',
            rowCount: 0,
          });
          if (error.code === '42P01') {
            recommendations.push(`La table "${name}" n'existe pas encore. Exécutez le script SQL de migration.`);
          } else if (error.code === '42501' || error.message.includes('policy')) {
            recommendations.push(`Politique RLS bloquante sur "${name}". Exécutez la mise à jour RLS.`);
          }
        } else {
          tables.push({
            name,
            status: 'ok',
            message: 'Connecté et accessible',
            rowCount: count ?? (data ? data.length : 0),
          });
        }
      } catch (err: any) {
        tables.push({
          name,
          status: 'error',
          message: err?.message || 'Échec réseau',
          rowCount: 0,
        });
      }
    }

    // Check storage buckets
    const bucketNames = ['profile', 'projects', 'services', 'resume', 'documents'];
    const storageBuckets: { name: string; status: 'ok' | 'warning' | 'error'; message: string }[] = [];

    for (const bName of bucketNames) {
      try {
        const { error } = await supabase.storage.from(bName).list('', { limit: 1 });
        if (error) {
          storageBuckets.push({
            name: bName,
            status: 'warning',
            message: error.message,
          });
        } else {
          storageBuckets.push({
            name: bName,
            status: 'ok',
            message: 'Bucket accessible',
          });
        }
      } catch (err: any) {
        storageBuckets.push({
          name: bName,
          status: 'warning',
          message: err?.message || 'Inaccessible',
        });
      }
    }

    const latencyMs = Date.now() - startTime;
    const hasErrors = tables.some((t) => t.status === 'error');
    const hasWarnings = tables.some((t) => t.status === 'warning') || storageBuckets.some((b) => b.status === 'warning');

    let overallStatus: DatabaseHealthReport['overallStatus'] = 'healthy';
    if (hasErrors) overallStatus = 'error';
    else if (hasWarnings) overallStatus = 'warning';

    if (recommendations.length === 0 && overallStatus === 'healthy') {
      recommendations.push('Toutes les tables et stockages Supabase répondent parfaitement. La synchronisation est 100% opérationnelle.');
    }

    return {
      supabaseConfigured: true,
      supabaseUrl,
      overallStatus,
      latencyMs,
      tables,
      storageBuckets,
      recommendations,
    };
  },

  // 11. SYNCHRONISATION GLOBALE VERS SUPABASE EN 1 CLIC
  async syncAllToSupabase(): Promise<{ success: boolean; syncedTables: string[]; errors: string[] }> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase n’est pas configuré.');
    }

    const syncedTables: string[] = [];
    const errors: string[] = [];

    // Profile
    try {
      const p = await this.getProfile();
      const { error } = await supabase.from('profiles').upsert(p, { onConflict: 'id' });
      if (error) errors.push(`profiles: ${error.message}`);
      else syncedTables.push('profiles');
    } catch (e: any) {
      errors.push(`profiles: ${e.message}`);
    }

    // Settings
    try {
      const s = await this.getSiteSettings();
      const { error } = await supabase.from('site_settings').upsert(s, { onConflict: 'id' });
      if (error) errors.push(`site_settings: ${error.message}`);
      else syncedTables.push('site_settings');
    } catch (e: any) {
      errors.push(`site_settings: ${e.message}`);
    }

    // Services
    try {
      const services = await this.getServices(true);
      for (const s of services) {
        await supabase.from('services').upsert(s, { onConflict: 'id' });
      }
      syncedTables.push(`services (${services.length})`);
    } catch (e: any) {
      errors.push(`services: ${e.message}`);
    }

    // Projects & Media
    try {
      const projects = await this.getProjects(true);
      for (const pr of projects) {
        const { media, ...prData } = pr as any;
        await supabase.from('projects').upsert(prData, { onConflict: 'id' });
        if (media && Array.isArray(media) && media.length > 0) {
          for (const m of media) {
            await supabase.from('project_media').upsert({
              id: isValidUUID(m.id) ? m.id : generateUUID(),
              project_id: pr.id,
              media_type: m.media_type || 'image',
              media_url: m.media_url,
              thumbnail_url: m.thumbnail_url || null,
              title: m.title || null,
              display_order: m.display_order ?? 1,
            }, { onConflict: 'id' });
          }
        }
      }
      syncedTables.push(`projects (${projects.length})`);
    } catch (e: any) {
      errors.push(`projects: ${e.message}`);
    }

    // Skills
    try {
      const skills = await this.getSkills(true);
      for (const sk of skills) {
        await supabase.from('skills').upsert(sk, { onConflict: 'id' });
      }
      syncedTables.push(`skills (${skills.length})`);
    } catch (e: any) {
      errors.push(`skills: ${e.message}`);
    }

    // Social Links
    try {
      const socials = await this.getSocialLinks(true);
      for (const sc of socials) {
        await supabase.from('social_links').upsert(sc, { onConflict: 'id' });
      }
      syncedTables.push(`social_links (${socials.length})`);
    } catch (e: any) {
      errors.push(`social_links: ${e.message}`);
    }

    return {
      success: errors.length === 0,
      syncedTables,
      errors,
    };
  },

  // 12. DASHBOARD STATS
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
