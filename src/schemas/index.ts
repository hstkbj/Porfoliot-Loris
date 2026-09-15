import { z } from 'zod';

export const serviceRequestSchema = z.object({
  full_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  phone: z.string().min(6, 'Numéro de téléphone requis'),
  company: z.string().optional(),
  service_id: z.string().min(1, 'Veuillez sélectionner un service'),
  budget: z.string().optional(),
  desired_date: z.string().optional(),
  description: z.string().min(10, 'Veuillez détailler votre projet (au moins 10 caractères)'),
  reference_url: z.string().url('URL invalide').optional().or(z.literal('')),
  attachment_url: z.string().optional(),
});

export type ServiceRequestFormData = z.infer<typeof serviceRequestSchema>;

export const contactMessageSchema = z.object({
  name: z.string().min(2, 'Veuillez indiquer votre nom'),
  email: z.string().email('Adresse email valide requise'),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10, 'Votre message doit contenir au moins 10 caractères'),
});

export type ContactMessageFormData = z.infer<typeof contactMessageSchema>;

export const projectSchema = z.object({
  title: z.string().min(2, 'Titre requis'),
  slug: z.string().min(2, 'Slug requis'),
  short_description: z.string().min(5, 'Description courte requise'),
  description: z.string().min(10, 'Description détaillée requise'),
  category: z.enum([
    'Montage vidéo',
    'Motion Design',
    'Publicité',
    'Réseaux sociaux',
    'Clip musical',
    'Vidéo corporate',
    'YouTube',
    'Animation',
    'Branding',
    'Autre'
  ]),
  client: z.string().min(1, 'Client ou production requis'),
  year: z.number().int().min(2000).max(2100),
  thumbnail_url: z.string().min(1, 'URL de miniature requise'),
  video_url: z.string().min(1, 'URL vidéo requise (YouTube, Vimeo, MP4 direct)'),
  external_url: z.string().url('URL invalide').optional().or(z.literal('')),
  tools: z.union([
    z.array(z.string()),
    z.string().transform((s) => s.split(',').map((t) => t.trim()).filter(Boolean)),
  ]),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  display_order: z.number().int().default(0),
});

export type ProjectFormData = any;

export const serviceSchema = z.object({
  title: z.string().min(2, 'Titre du service requis'),
  slug: z.string().min(2, 'Slug requis'),
  description: z.string().min(10, 'Description requise'),
  icon: z.string().min(1, 'Icône requise'),
  image_url: z.string().optional().or(z.literal('')),
  indicative_price: z.string().optional().or(z.literal('')),
  indicative_duration: z.string().optional().or(z.literal('')),
  active: z.boolean().default(true),
  display_order: z.number().int().default(0),
});

export type ServiceFormData = any;

export const profileSchema = z.object({
  first_name: z.string().min(1, 'Prénom requis'),
  last_name: z.string().min(1, 'Nom requis'),
  professional_name: z.string().min(1, 'Nom de studio / professionnel requis'),
  job_title: z.string().min(2, 'Titre de poste requis'),
  bio: z.string().min(20, 'Biographie détaillée requise'),
  short_bio: z.string().min(10, 'Courte présentation requise'),
  photo_url: z.string().min(1, 'URL de photo requise'),
  location: z.string().min(2, 'Localisation requise'),
  email: z.string().email('Email valide requis'),
  phone: z.string().min(6, 'Téléphone requis'),
  years_experience: z.number().min(0).max(50),
  availability: z.boolean().default(true),
  hero_title: z.string().min(5, 'Titre Hero requis'),
  hero_description: z.string().min(10, 'Description Hero requise'),
});

export type ProfileFormData = any;

export const siteSettingsSchema = z.object({
  site_name: z.string().min(2, 'Nom du site requis'),
  site_description: z.string().min(10, 'Description requise'),
  logo_url: z.string().optional().or(z.literal('')),
  favicon_url: z.string().optional().or(z.literal('')),
  seo_title: z.string().min(2, 'Titre SEO requis'),
  seo_description: z.string().min(10, 'Description SEO requise'),
  primary_color: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, 'Couleur hexadécimale valide requise (ex: #f59e0b)'),
  contact_email: z.string().email('Email de contact valide requis'),
  contact_phone: z.string().min(6, 'Téléphone requis'),
  location: z.string().min(2, 'Localisation requise'),
  copyright_text: z.string().min(2, 'Texte de copyright requis'),
  budget_tiers: z.array(z.string()).optional(),
});

export type SiteSettingsFormData = any;

export const loginSchema = z.object({
  email: z.string().email('Adresse email valide requise'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
