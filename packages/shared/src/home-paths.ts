import os from "node:os";
import path from "node:path";
import fs from "node:fs";

export const DEFAULT_PAPERCLIP_INSTANCE_ID = "default";
export const PAPERCLIP_CONFIG_BASENAME = "config.json";
export const PAPERCLIP_ENV_FILENAME = ".env";

const PATH_SEGMENT_RE = /^[a-zA-Z0-9_-]+$/;

/** Vars that have already emitted a deprecation warning this process lifetime. */
const warnedHomeVars = new Set<string>();

function warnHomeLegacy(legacyName: string, newName: string): void {
  if (warnedHomeVars.has(legacyName)) return;
  warnedHomeVars.add(legacyName);
  process.stderr.write(
    `[ardonex] DeprecationWarning: Environment variable ${legacyName} is deprecated. Use ${newName} instead. Support will be removed in a future release.\n`,
  );
}

export function expandHomePrefix(value: string): string {
  if (value === "~") return os.homedir();
  if (value.startsWith("~/")) return path.resolve(os.homedir(), value.slice(2));
  return value;
}

/**
 * Resolve the Pioneer home directory.
 *
 * Priority order:
 *  1. Explicit `homeOverride` argument
 *  2. ARDONEX_HOME env var
 *  3. PAPERCLIP_HOME env var (deprecated — emits a one-time warning)
 *  4. Default: ~/.ardonex
 *
 * @deprecated The exported name `resolvePaperclipHomeDir` is preserved for
 *   backward-compatibility with internal callers; use `resolvePioneerHomeDir`
 *   in new code.
 */
export function resolvePioneerHomeDir(homeOverride?: string): string {
  const raw = homeOverride?.trim()
    || process.env.ARDONEX_HOME?.trim()
    || (() => {
      const legacy = process.env.PAPERCLIP_HOME?.trim();
      if (legacy) {
        warnHomeLegacy("PAPERCLIP_HOME", "ARDONEX_HOME");
        return legacy;
      }
      return undefined;
    })();
  if (raw) return path.resolve(expandHomePrefix(raw));
  return path.resolve(os.homedir(), ".ardonex");
}

/** @deprecated Use `resolvePioneerHomeDir` in new code. */
export const resolvePaperclipHomeDir = resolvePioneerHomeDir;

export function resolvePaperclipInstanceId(instanceIdOverride?: string): string {
  const raw =
    instanceIdOverride?.trim()
    || process.env.ARDONEX_INSTANCE_ID?.trim()
    || (() => {
      const legacy = process.env.PAPERCLIP_INSTANCE_ID?.trim();
      if (legacy) {
        warnHomeLegacy("PAPERCLIP_INSTANCE_ID", "ARDONEX_INSTANCE_ID");
        return legacy;
      }
      return undefined;
    })()
    || DEFAULT_PAPERCLIP_INSTANCE_ID;
  if (!PATH_SEGMENT_RE.test(raw)) {
    throw new Error(`Invalid ARDONEX_INSTANCE_ID '${raw}'.`);
  }
  return raw;
}

export function resolvePaperclipInstanceRoot(input: {
  homeDir?: string;
  instanceId?: string;
} = {}): string {
  return path.resolve(resolvePioneerHomeDir(input.homeDir), "instances", resolvePaperclipInstanceId(input.instanceId));
}

export function resolvePaperclipInstanceConfigPath(input: {
  homeDir?: string;
  instanceId?: string;
} = {}): string {
  return path.resolve(resolvePaperclipInstanceRoot(input), PAPERCLIP_CONFIG_BASENAME);
}

export function resolvePaperclipConfigPathForInstance(input: {
  homeDir?: string;
  instanceId?: string;
} = {}): string {
  return resolvePaperclipInstanceConfigPath(input);
}

export function resolvePaperclipEnvPathForConfig(configPath: string): string {
  return path.resolve(path.dirname(configPath), PAPERCLIP_ENV_FILENAME);
}

export function resolveDefaultEmbeddedPostgresDir(input: {
  homeDir?: string;
  instanceId?: string;
} = {}): string {
  return path.resolve(resolvePaperclipInstanceRoot(input), "db");
}

export function resolveDefaultLogsDir(input: {
  homeDir?: string;
  instanceId?: string;
} = {}): string {
  return path.resolve(resolvePaperclipInstanceRoot(input), "logs");
}

export function resolveDefaultSecretsKeyFilePath(input: {
  homeDir?: string;
  instanceId?: string;
} = {}): string {
  return path.resolve(resolvePaperclipInstanceRoot(input), "secrets", "master.key");
}

export function resolveDefaultStorageDir(input: {
  homeDir?: string;
  instanceId?: string;
} = {}): string {
  return path.resolve(resolvePaperclipInstanceRoot(input), "data", "storage");
}

export function resolveDefaultBackupDir(input: {
  homeDir?: string;
  instanceId?: string;
} = {}): string {
  return path.resolve(resolvePaperclipInstanceRoot(input), "data", "backups");
}

export function resolveHomeAwarePath(value: string): string {
  return path.resolve(expandHomePrefix(value));
}

/**
 * Migrate `~/.paperclip` → `~/.ardonex` on first startup.
 *
 * Logic:
 * - If target already exists: no-op (already migrated or fresh install).
 * - If source exists and target absent: rename source to target, create symlink
 *   source → target so tools that still reference the old path keep working.
 * - If both exist: refuse to start — print a clear error and throw.
 * - If neither exists: no-op (fresh install, ~/.ardonex will be created on demand).
 *
 * Pass `dryRun: true` to check without making changes (returns the action that
 * would be taken).
 */
export function migrateLegacyHomeDir(opts: { dryRun?: boolean } = {}): "none" | "migrated" | "already_migrated" {
  const legacyDir = path.resolve(os.homedir(), ".paperclip");
  const newDir = path.resolve(os.homedir(), ".ardonex");

  const legacyExists = fs.existsSync(legacyDir);
  const newExists = fs.existsSync(newDir);

  if (newExists) {
    // Already migrated or fresh install — check if legacy was left as a symlink.
    if (legacyExists) {
      try {
        const stat = fs.lstatSync(legacyDir);
        if (!stat.isSymbolicLink()) {
          // Both real directories exist — this is ambiguous, refuse to proceed.
          throw new Error(
            `[ardonex] Migration error: both ~/.paperclip and ~/.ardonex exist as real directories.\n` +
            `To resolve: manually verify your data, move/merge one into the other, then remove the duplicate.\n` +
            `Ardonex will not start until this is resolved to prevent data loss.`,
          );
        }
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
      }
    }
    return "already_migrated";
  }

  if (!legacyExists) {
    return "none"; // Fresh install, nothing to migrate.
  }

  if (opts.dryRun) return "migrated";

  // Move ~/.paperclip → ~/.ardonex, then symlink the legacy path.
  fs.renameSync(legacyDir, newDir);
  try {
    fs.symlinkSync(newDir, legacyDir);
  } catch {
    // Non-fatal: symlink creation failed (e.g. permissions). Log and continue.
    process.stderr.write(
      `[ardonex] Warning: migrated ~/.paperclip to ~/.ardonex but could not create backward-compat symlink: ${legacyDir} → ${newDir}.\n`,
    );
  }

  process.stderr.write(
    `[ardonex] Migrated ~/.paperclip to ~/.ardonex. A compatibility symlink was created at ~/.paperclip for this release.\n`,
  );

  return "migrated";
}
