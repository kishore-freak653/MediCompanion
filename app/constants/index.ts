/**
 * Application constants. Single source of truth for routes, labels, and config.
 */

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  ROLE_SELECT: "/role-select",
  DASHBOARD: "/dashboard",
} as const;

export const DASHBOARD_PARAMS = {
  ROLE: "role",
  TAB: "tab",
} as const;

export const VIEW_ROLES = ["caretaker", "patient"] as const;
export type ViewRole = (typeof VIEW_ROLES)[number];

export const PATIENT_TABS = ["today", "schedule", "history"] as const;
export type PatientTab = (typeof PATIENT_TABS)[number];

export const HISTORY_PERIODS = [7, 30, 90] as const;

export const TOAST_DURATION = 4000;
