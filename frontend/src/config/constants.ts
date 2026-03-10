export const APP_NAME = 'Bridge';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api/';

export const ROUTES = {
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
  },
  DASHBOARD: '/',
  TICKETS: {
    LIST: '/tickets',
    CREATE: '/tickets/new',
    DETAIL: '/tickets/:id',
  },
  USERS: '/users',
  CATEGORIES: '/categories',
  PROFILE: '/profile',
} as const;

export const TICKET_STATUS_LABELS: Record<string, string> = {
  OPEN: 'Ouvert',
  IN_PROGRESS: 'En cours',
  RESOLVED: 'Résolu',
  CLOSED: 'Fermé',
};

export const TICKET_PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Faible',
  MEDIUM: 'Moyen',
  HIGH: 'Élevé',
  CRITICAL: 'Critique',
};

export const ROLE_LABELS: Record<string, string> = {
  USER: 'Utilisateur',
  HELPDESK: 'Support Bridge',
  ADMIN: 'Administrateur',
};

export const PAGE_SIZE = 10;
