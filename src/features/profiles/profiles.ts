/**
 * features/profiles/profiles — activación y gestión de perfiles.
 *
 * Activar un perfil bloquea la sesión (borra la clave en memoria) y deja como
 * activa su base de datos. El cambio de BD real lo realiza `AppArea` cuando
 * detecta el nuevo `activeId`.
 */
import { lock } from '@/lib/crypto';
import { deleteProfileDb } from '@/lib/db';
import { useProfilesStore } from '@/stores/profilesStore';

/** Cambia el perfil activo (bloquea la sesión actual). */
export const activateProfile = (id: string): void => {
  lock();
  useProfilesStore.getState().setActiveId(id);
};

/** Crea un perfil nuevo y lo activa (mostrará la creación de PIN). */
export const createProfile = (name: string): string => {
  const id = useProfilesStore.getState().addProfile(name.trim() || 'Perfil');
  activateProfile(id);
  return id;
};

/** Borra un perfil y su base de datos. No permite borrar el activo. */
export const deleteProfile = async (id: string): Promise<void> => {
  const { activeId, removeProfile } = useProfilesStore.getState();
  if (id === activeId || id === 'default') return;
  await deleteProfileDb(id);
  removeProfile(id);
};
