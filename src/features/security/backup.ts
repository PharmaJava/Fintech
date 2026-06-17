/**
 * features/security/backup — copia de seguridad cifrada (AES-GCM).
 *
 * El backup es un fichero JSON cuyo contenido va cifrado con una clave derivada
 * (PBKDF2) de una contrasena de backup ELEGIDA POR EL USUARIO, independiente del
 * PIN. Asi el fichero es portable y autoprotegido aunque salga del dispositivo.
 *
 * Al restaurar, los datos se vuelven a cifrar con la clave de sesion actual (el
 * PIN del dispositivo), no con la contrasena del backup.
 */
import {
  decryptString,
  deriveKey,
  encryptString,
  generateSalt,
  saltFromBase64,
  saltToBase64,
} from '@/lib/crypto';
import {
  restoreAll,
  snapshotAll,
  type DataSnapshot,
} from '@/lib/repositories/maintenance';

const BACKUP_FORMAT = 'patrimonio-backup';
const BACKUP_VERSION = 1;

interface BackupFile {
  format: string;
  version: number;
  salt: string;
  iv: string;
  ct: string;
}

/** Genera un Blob con el backup cifrado de todos los datos. */
export const createBackup = async (password: string): Promise<Blob> => {
  if (password.length < 6) {
    throw new Error(
      'La contrasena de backup debe tener al menos 6 caracteres.',
    );
  }
  const snapshot = await snapshotAll();
  const salt = generateSalt();
  const key = await deriveKey(password, salt);
  const encrypted = await encryptString(key, JSON.stringify(snapshot));

  const file: BackupFile = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    salt: saltToBase64(salt),
    iv: encrypted.iv,
    ct: encrypted.ct,
  };
  return new Blob([JSON.stringify(file)], { type: 'application/json' });
};

const isBackupFile = (value: unknown): value is BackupFile => {
  if (typeof value !== 'object' || value === null) return false;
  const file = value as Record<string, unknown>;
  return (
    file.format === BACKUP_FORMAT &&
    typeof file.salt === 'string' &&
    typeof file.iv === 'string' &&
    typeof file.ct === 'string'
  );
};

/**
 * Restaura un backup cifrado. Lanza si la contrasena es incorrecta o el fichero
 * no es valido. Reemplaza todos los datos actuales.
 */
export const restoreBackup = async (
  password: string,
  fileText: string,
): Promise<void> => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(fileText);
  } catch {
    throw new Error('El fichero no es un backup valido.');
  }
  if (!isBackupFile(parsed)) {
    throw new Error('El fichero no es un backup de Patrimonio.');
  }

  const key = await deriveKey(password, saltFromBase64(parsed.salt));
  let json: string;
  try {
    json = await decryptString(key, { iv: parsed.iv, ct: parsed.ct });
  } catch {
    throw new Error('Contrasena de backup incorrecta.');
  }

  const snapshot = JSON.parse(json) as DataSnapshot;
  await restoreAll(snapshot);
};
