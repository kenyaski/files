
import { FileMetadata, Course } from './types';

/**
 * PRODUCTION BRANDING & THEME
 */
export const COLORS = {
  primary: '#064e3b', // Deep Academic Green
  secondary: '#facc15', // Vibrant Yellow
  accentGold: '#fbbf24',
  accentGreen: '#10b981',
  bgSlate: '#f8fafc',
};

/**
 * INSTITUTIONAL COURSE CONFIGURATION
 * To be populated by the Polytechnic Registrar or Admin
 */
export const AVAILABLE_COURSES: Course[] = [];

/**
 * INSTITUTIONAL VAULT REPOSITORY
 * Maps course IDs to their respective academic PDF/Doc libraries.
 */
export const DEPARTMENT_VAULTS: Record<string, FileMetadata[]> = {};

/**
 * INITIAL USER RESEARCH REPOSITORY
 * Starts empty for fresh student sessions.
 */
export const INITIAL_RESEARCH: FileMetadata[] = [];
