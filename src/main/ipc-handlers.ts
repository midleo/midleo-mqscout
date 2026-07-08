import { ipcMain, safeStorage } from 'electron';
import { promises as fs } from 'node:fs';
import { IPC_CHANNELS } from '../shared/ipc-channels';
import { assertJavaRuntimeReady, buildJavaArgs, type JavaRuntime } from './jar-path';

interface HandlerContext {
  appHome: string;
  qmListPath: string;
  javaRuntime: JavaRuntime;
  execFileAsync: (
    file: string,
    args: readonly string[],
    options?: { maxBuffer?: number; timeout?: number }
  ) => Promise<{ stdout: string; stderr: string }>;
}

const ENCRYPTED_PREFIX = 'enc:';

function encryptSecret(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  if (value.startsWith(ENCRYPTED_PREFIX)) {
    return value;
  }
  if (!safeStorage.isEncryptionAvailable()) {
    return value;
  }
  try {
    return `${ENCRYPTED_PREFIX}${safeStorage.encryptString(value).toString('base64')}`;
  } catch {
    return value;
  }
}

function decryptSecret(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  if (!value.startsWith(ENCRYPTED_PREFIX)) {
    return value;
  }
  if (!safeStorage.isEncryptionAvailable()) {
    return value;
  }
  try {
    return safeStorage.decryptString(Buffer.from(value.slice(ENCRYPTED_PREFIX.length), 'base64'));
  } catch {
    return value;
  }
}

function sanitizeQmConfig(raw: string): string {
  const parsed = JSON.parse(raw) as Array<Record<string, unknown>>;
  const filtered = parsed.filter(
    (group) => group && typeof group['name'] === 'string' && Array.isArray(group['children'])
  );
  return JSON.stringify(filtered);
}

function protectQmConfig(raw: string): string {
  const parsed = JSON.parse(sanitizeQmConfig(raw)) as Array<Record<string, unknown>>;
  for (const group of parsed) {
    const children = group['children'] as Array<Record<string, unknown>> | undefined;
    if (!Array.isArray(children)) {
      continue;
    }
    for (const qm of children) {
      if (typeof qm['sslpass'] === 'string') {
        qm['sslpass'] = encryptSecret(qm['sslpass']);
      }
    }
  }
  return JSON.stringify(parsed);
}

function exposeQmConfig(raw: string): string {
  const parsed = JSON.parse(raw) as Array<Record<string, unknown>>;
  const filtered = parsed.filter(
    (group) => group && typeof group['name'] === 'string' && Array.isArray(group['children'])
  );
  for (const group of filtered) {
    const children = group['children'] as Array<Record<string, unknown>> | undefined;
    if (!Array.isArray(children)) {
      continue;
    }
    for (const qm of children) {
      if (typeof qm['sslpass'] === 'string') {
        qm['sslpass'] = decryptSecret(qm['sslpass']);
      }
    }
  }
  return JSON.stringify(filtered);
}

export function registerIpcHandlers(ctx: HandlerContext): void {
  ipcMain.handle(IPC_CHANNELS.READ_QM_LIST, async () => {
    try {
      const raw = await fs.readFile(ctx.qmListPath, 'utf8');
      return exposeQmConfig(raw);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return '[]';
      }
      throw new Error(
        `Failed to read queue managers from ${ctx.qmListPath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });

  ipcMain.handle(IPC_CHANNELS.UPDATE_QM, async (_event, data: string) => {
    if (typeof data !== 'string') {
      throw new Error('Invalid queue manager payload');
    }
    try {
      JSON.parse(data);
      const protectedConfig = protectQmConfig(data);
      await fs.mkdir(ctx.appHome, { recursive: true });
      await fs.writeFile(ctx.qmListPath, protectedConfig, 'utf8');
      return 'Queue managers updated successfully';
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid queue manager JSON');
      }
      throw new Error(
        `Failed to save queue managers to ${ctx.qmListPath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });

  ipcMain.handle(IPC_CHANNELS.EXEC_PCFQD, async (_event, payload: string) => {
    if (typeof payload !== 'string' || payload.length > 65536) {
      throw new Error('Invalid MQ command payload');
    }

    JSON.parse(payload);

    await assertJavaRuntimeReady(ctx.javaRuntime);

    const javaArgs = buildJavaArgs(ctx.javaRuntime, payload);
    const { stdout, stderr } = await ctx.execFileAsync('java', javaArgs, {
      maxBuffer: 50 * 1024 * 1024,
      timeout: 120_000,
    });

    if (stderr?.trim()) {
      return stderr;
    }
    return stdout;
  });
}
