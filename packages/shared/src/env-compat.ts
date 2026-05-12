/**
 * env-compat.ts — dual-read shim for ARDONEX_* / PAPERCLIP_* environment variables
 *
 * Preference: ARDONEX_* (new name) takes priority over PAPERCLIP_* (legacy name).
 * Legacy names emit a one-time deprecation warning per process per variable.
 *
 * Call `applyEnvCompatShim()` once at process startup (before any config reads)
 * to normalise process.env so all downstream code continues to work unchanged.
 */

// Vars that appear in both the server/operator config context AND the agent-injection context.
// Key: ARDONEX_* name, Value: PAPERCLIP_* legacy name.
export const ARDONEX_ENV_MAP: ReadonlyRecord<string, string> = {
  // Instance / home layout
  ARDONEX_HOME: "PAPERCLIP_HOME",
  ARDONEX_INSTANCE_ID: "PAPERCLIP_INSTANCE_ID",
  ARDONEX_CONFIG: "PAPERCLIP_CONFIG",
  // Deployment / server config
  ARDONEX_DEPLOYMENT_MODE: "PAPERCLIP_DEPLOYMENT_MODE",
  ARDONEX_DEPLOYMENT_EXPOSURE: "PAPERCLIP_DEPLOYMENT_EXPOSURE",
  ARDONEX_BIND: "PAPERCLIP_BIND",
  ARDONEX_BIND_HOST: "PAPERCLIP_BIND_HOST",
  ARDONEX_TAILNET_BIND_HOST: "PAPERCLIP_TAILNET_BIND_HOST",
  ARDONEX_PUBLIC_URL: "PAPERCLIP_PUBLIC_URL",
  ARDONEX_AUTH_BASE_URL_MODE: "PAPERCLIP_AUTH_BASE_URL_MODE",
  ARDONEX_AUTH_PUBLIC_BASE_URL: "PAPERCLIP_AUTH_PUBLIC_BASE_URL",
  ARDONEX_AUTH_DISABLE_SIGN_UP: "PAPERCLIP_AUTH_DISABLE_SIGN_UP",
  ARDONEX_ALLOWED_HOSTNAMES: "PAPERCLIP_ALLOWED_HOSTNAMES",
  ARDONEX_ENABLE_COMPANY_DELETION: "PAPERCLIP_ENABLE_COMPANY_DELETION",
  ARDONEX_UI_DEV_MIDDLEWARE: "PAPERCLIP_UI_DEV_MIDDLEWARE",
  // Secrets
  ARDONEX_SECRETS_PROVIDER: "PAPERCLIP_SECRETS_PROVIDER",
  ARDONEX_SECRETS_MASTER_KEY: "PAPERCLIP_SECRETS_MASTER_KEY",
  ARDONEX_SECRETS_MASTER_KEY_FILE: "PAPERCLIP_SECRETS_MASTER_KEY_FILE",
  ARDONEX_SECRETS_STRICT_MODE: "PAPERCLIP_SECRETS_STRICT_MODE",
  // JWT / auth
  ARDONEX_AGENT_JWT_SECRET: "PAPERCLIP_AGENT_JWT_SECRET",
  ARDONEX_AUTH_STORE: "PAPERCLIP_AUTH_STORE",
  // Storage
  ARDONEX_STORAGE_PROVIDER: "PAPERCLIP_STORAGE_PROVIDER",
  ARDONEX_STORAGE_LOCAL_DIR: "PAPERCLIP_STORAGE_LOCAL_DIR",
  ARDONEX_STORAGE_S3_BUCKET: "PAPERCLIP_STORAGE_S3_BUCKET",
  ARDONEX_STORAGE_S3_REGION: "PAPERCLIP_STORAGE_S3_REGION",
  ARDONEX_STORAGE_S3_ENDPOINT: "PAPERCLIP_STORAGE_S3_ENDPOINT",
  ARDONEX_STORAGE_S3_PREFIX: "PAPERCLIP_STORAGE_S3_PREFIX",
  ARDONEX_STORAGE_S3_FORCE_PATH_STYLE: "PAPERCLIP_STORAGE_S3_FORCE_PATH_STYLE",
  // Database backup
  ARDONEX_DB_BACKUP_ENABLED: "PAPERCLIP_DB_BACKUP_ENABLED",
  ARDONEX_DB_BACKUP_INTERVAL_MINUTES: "PAPERCLIP_DB_BACKUP_INTERVAL_MINUTES",
  ARDONEX_DB_BACKUP_RETENTION_DAYS: "PAPERCLIP_DB_BACKUP_RETENTION_DAYS",
  ARDONEX_DB_BACKUP_DIR: "PAPERCLIP_DB_BACKUP_DIR",
  // Telemetry / feedback
  ARDONEX_TELEMETRY_DISABLED: "PAPERCLIP_TELEMETRY_DISABLED",
  ARDONEX_TELEMETRY_BACKEND_URL: "PAPERCLIP_TELEMETRY_BACKEND_URL",
  ARDONEX_TELEMETRY_BACKEND_TOKEN: "PAPERCLIP_TELEMETRY_BACKEND_TOKEN",
  ARDONEX_FEEDBACK_EXPORT_BACKEND_URL: "PAPERCLIP_FEEDBACK_EXPORT_BACKEND_URL",
  ARDONEX_FEEDBACK_EXPORT_BACKEND_TOKEN: "PAPERCLIP_FEEDBACK_EXPORT_BACKEND_TOKEN",
  // Smoke / release
  ARDONEX_RELEASE_SMOKE_BASE_URL: "PAPERCLIP_RELEASE_SMOKE_BASE_URL",
  // Migration
  ARDONEX_MIGRATION_AUTO_APPLY: "PAPERCLIP_MIGRATION_AUTO_APPLY",
  // Agent-injected run context (set by server, read by agents)
  ARDONEX_API_URL: "PAPERCLIP_API_URL",
  ARDONEX_API_KEY: "PAPERCLIP_API_KEY",
  ARDONEX_AGENT_ID: "PAPERCLIP_AGENT_ID",
  ARDONEX_COMPANY_ID: "PAPERCLIP_COMPANY_ID",
  ARDONEX_RUN_ID: "PAPERCLIP_RUN_ID",
  ARDONEX_TASK_ID: "PAPERCLIP_TASK_ID",
  ARDONEX_WAKE_REASON: "PAPERCLIP_WAKE_REASON",
  ARDONEX_WAKE_COMMENT_ID: "PAPERCLIP_WAKE_COMMENT_ID",
  ARDONEX_WAKE_PAYLOAD_JSON: "PAPERCLIP_WAKE_PAYLOAD_JSON",
  ARDONEX_APPROVAL_ID: "PAPERCLIP_APPROVAL_ID",
  ARDONEX_APPROVAL_STATUS: "PAPERCLIP_APPROVAL_STATUS",
  ARDONEX_LINKED_ISSUE_IDS: "PAPERCLIP_LINKED_ISSUE_IDS",
  ARDONEX_ISSUE_WORK_MODE: "PAPERCLIP_ISSUE_WORK_MODE",
  ARDONEX_RESOLVED_COMMAND: "PAPERCLIP_RESOLVED_COMMAND",
  // Workspace vars
  ARDONEX_WORKSPACE_CWD: "PAPERCLIP_WORKSPACE_CWD",
  ARDONEX_WORKSPACE_PATH: "PAPERCLIP_WORKSPACE_PATH",
  ARDONEX_WORKSPACE_WORKTREE_PATH: "PAPERCLIP_WORKSPACE_WORKTREE_PATH",
  ARDONEX_WORKSPACE_BRANCH: "PAPERCLIP_WORKSPACE_BRANCH",
  ARDONEX_WORKSPACE_BASE_CWD: "PAPERCLIP_WORKSPACE_BASE_CWD",
  ARDONEX_WORKSPACE_REPO_ROOT: "PAPERCLIP_WORKSPACE_REPO_ROOT",
  ARDONEX_WORKSPACE_SOURCE: "PAPERCLIP_WORKSPACE_SOURCE",
  ARDONEX_WORKSPACE_REPO_REF: "PAPERCLIP_WORKSPACE_REPO_REF",
  ARDONEX_WORKSPACE_REPO_URL: "PAPERCLIP_WORKSPACE_REPO_URL",
  ARDONEX_WORKSPACE_CREATED: "PAPERCLIP_WORKSPACE_CREATED",
  ARDONEX_WORKSPACE_STRATEGY: "PAPERCLIP_WORKSPACE_STRATEGY",
  ARDONEX_WORKSPACE_ID: "PAPERCLIP_WORKSPACE_ID",
  ARDONEX_PROJECT_ID: "PAPERCLIP_PROJECT_ID",
  ARDONEX_PROJECT_WORKSPACE_ID: "PAPERCLIP_PROJECT_WORKSPACE_ID",
  ARDONEX_AGENT_NAME: "PAPERCLIP_AGENT_NAME",
  ARDONEX_ISSUE_ID: "PAPERCLIP_ISSUE_ID",
  ARDONEX_ISSUE_IDENTIFIER: "PAPERCLIP_ISSUE_IDENTIFIER",
  ARDONEX_ISSUE_TITLE: "PAPERCLIP_ISSUE_TITLE",
  ARDONEX_CONTEXT: "PAPERCLIP_CONTEXT",
};

// Reverse map: PAPERCLIP_* → ARDONEX_* (for deprecation warnings)
export const PAPERCLIP_TO_ARDONEX_MAP: ReadonlyRecord<string, string> = Object.fromEntries(
  Object.entries(ARDONEX_ENV_MAP).map(([ardonex, paperclip]) => [paperclip, ardonex]),
);

type ReadonlyRecord<K extends string, V> = Readonly<Record<K, V>>;

/** Vars that have already emitted a deprecation warning this process lifetime. */
const warnedVars = new Set<string>();

/** Emit a deprecation warning at most once per legacy var name per process. */
function warnDeprecated(legacyName: string, newName: string): void {
  if (warnedVars.has(legacyName)) return;
  warnedVars.add(legacyName);
  process.stderr.write(
    `[ardonex] DeprecationWarning: Environment variable ${legacyName} is deprecated. Use ${newName} instead. Support will be removed in a future release.\n`,
  );
}

/**
 * Apply the ARDONEX_* / PAPERCLIP_* dual-read shim to process.env.
 *
 * Rules (applied in this priority order):
 * 1. If ARDONEX_X is set → also ensure PAPERCLIP_X has that value (may override legacy).
 * 2. Else if PAPERCLIP_X is set → emit a one-time deprecation warning and also set ARDONEX_X.
 *
 * After this runs, every normalised env var is present under both names.
 * Downstream code that reads PAPERCLIP_* continues to work without changes.
 */
export function applyEnvCompatShim(): void {
  for (const [ardonexKey, paperclipKey] of Object.entries(ARDONEX_ENV_MAP)) {
    const ardonexVal = process.env[ardonexKey];
    const paperclipVal = process.env[paperclipKey];

    if (ardonexVal !== undefined) {
      // ARDONEX_* is authoritative: propagate to legacy name so existing code works.
      process.env[paperclipKey] = ardonexVal;
    } else if (paperclipVal !== undefined) {
      // Legacy only: warn once and back-fill ARDONEX_*.
      warnDeprecated(paperclipKey, ardonexKey);
      process.env[ardonexKey] = paperclipVal;
    }
  }
}

/**
 * Read a ARDONEX_* var with a fallback to PAPERCLIP_* (with one-time deprecation warning).
 * Returns undefined when neither is set.
 *
 * `suffix` is the part after the prefix, e.g. "HOME" for ARDONEX_HOME / PAPERCLIP_HOME.
 */
export function readPioneerEnv(suffix: string): string | undefined {
  const ardonexKey = `ARDONEX_${suffix}`;
  const paperclipKey = `PAPERCLIP_${suffix}`;

  const ardonexVal = process.env[ardonexKey];
  if (ardonexVal !== undefined) return ardonexVal;

  const paperclipVal = process.env[paperclipKey];
  if (paperclipVal !== undefined) {
    warnDeprecated(paperclipKey, ardonexKey);
    return paperclipVal;
  }

  return undefined;
}

/**
 * Given an env record built with PAPERCLIP_* keys, return a new record that
 * additionally contains the ARDONEX_* counterpart for every key that appears in
 * PAPERCLIP_TO_ARDONEX_MAP. Both names resolve to the same value so agents can
 * use either prefix.
 */
export function addPioneerEnvAliases(env: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = { ...env };
  for (const [paperclipKey, ardonexKey] of Object.entries(PAPERCLIP_TO_ARDONEX_MAP)) {
    const val = env[paperclipKey];
    if (val !== undefined) {
      out[ardonexKey] = val;
    }
  }
  return out;
}
