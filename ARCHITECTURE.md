# Architecture & Conventions

Brief overview for reviewers and interviews.

## Code organization

- **`/app/constants`** — Routes, param names, config (single source of truth).
- **`/app/lib/errors`** — Error types and user-facing messages (no raw internal errors to UI).
- **`/app/types`** — Domain types; export via `types/index.ts`.
- **`/app/utils/sanitize`** — Input sanitization for names, dosage, notes, time (XSS and length limits).

## Error handling

- **ErrorBoundary** wraps main dashboard content; catches render errors and shows a retry UI.
- **Hooks** catch async errors, show toast via centralized `ErrorMessages`, and set local error state where useful.
- **Services** throw; callers (hooks) are responsible for catch and user feedback.
- **TypeScript** — `catch (err: unknown)` and type guards; no `any` in catch.

## TypeScript

- No `any`; use `unknown` for caught errors and narrow with type guards.
- Props use explicit interfaces (e.g. `PatientViewProps`, `ScheduleViewProps`).
- Domain types live in `app/types` and are used in services and components.

## Component composition

- **Reusable UI**: `StatCard`, `Input`, `Button`, `Modal` in `components/ui`.
- **Feature components**: `PatientView`, `CareTaker`, `ScheduleView`, `HistoryView` — each focused on one area.
- **ErrorBoundary** used around the main content area.

## State management

- **URL** drives view and tab (`?role=patient&tab=schedule`).
- **Hooks** own data and actions: `useMedications`, `useMedicationLogs`, `useMedicationHistory`.
- **Dashboard** composes hooks and passes data down as props; no global store.
- **State** is colocated with the feature that needs it; shared data (e.g. `takenIds`) comes from a single hook and is passed down.

## Performance

- **React.memo** on `PatientView`, `ScheduleView`, `StatCard` to avoid unnecessary re-renders when props are unchanged.
- **useCallback** for event handlers and async actions passed to children (e.g. `fetchMedications`, `markMedAsTaken`).
- **useMemo** for derived data (e.g. `navItems`, `statsStripConfig`, `weekStart` in ScheduleView).

## Security

- **Input sanitization** before sending to API or storing: `sanitizeMedicationName`, `sanitizeDosage`, `sanitizeNotes`, `sanitizeTime` in `utils/sanitize`.
- Strip HTML/script patterns and enforce max lengths to reduce XSS and abuse.
- Auth and routing: unauthenticated users redirected to login; Supabase RLS should enforce server-side access control.
