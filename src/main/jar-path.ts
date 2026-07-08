import { promises as fs } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const JAR_FILENAME = 'midleo.jar';
const MIDLEOLIBS_DIR = 'midleolibs';
const MAIN_CLASS = 'midleo.midleo_main';

const CLASSPATH_SEPARATOR = process.platform === 'win32' ? ';' : ':';

export const LICENSED_FILES_ERROR =
  'Place licensed files in ~/.midleo/ — see README. Contact https://vasilev.link for distribution.';

export interface JavaRuntime {
  jarPath: string;
  midleoLibsRoot: string;
  classpath: string;
  mainClass: string;
}

export function getAppHome(): string {
  return join(homedir(), '.midleo');
}

export function getUserJarPath(): string {
  return join(getAppHome(), JAR_FILENAME);
}

function getUserMidleoLibsRoot(): string {
  return join(getAppHome(), MIDLEOLIBS_DIR);
}

function buildClasspath(midleoLibsRoot: string, jarPath: string): string {
  const libsGlob = join(midleoLibsRoot, 'libs', '*');
  const vendorGlob = join(midleoLibsRoot, 'vendor', '*');
  return [libsGlob, vendorGlob, jarPath].join(CLASSPATH_SEPARATOR);
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolves jar, midleolibs, and classpath for Java execution from ~/.midleo/.
 */
export async function resolveJavaRuntime(): Promise<JavaRuntime> {
  const midleoLibsRoot = getUserMidleoLibsRoot();
  const jarPath = getUserJarPath();

  return {
    jarPath,
    midleoLibsRoot,
    classpath: buildClasspath(midleoLibsRoot, jarPath),
    mainClass: MAIN_CLASS,
  };
}

export async function assertJavaRuntimeReady(runtime: JavaRuntime): Promise<void> {
  const jarOk = await fileExists(runtime.jarPath);
  const libsOk = await fileExists(join(runtime.midleoLibsRoot, 'libs'));
  const vendorOk = await fileExists(join(runtime.midleoLibsRoot, 'vendor'));
  if (!jarOk || !libsOk || !vendorOk) {
    throw new Error(LICENSED_FILES_ERROR);
  }
}

export function buildJavaArgs(runtime: JavaRuntime, payload: string): string[] {
  return ['-cp', runtime.classpath, runtime.mainClass, payload];
}
