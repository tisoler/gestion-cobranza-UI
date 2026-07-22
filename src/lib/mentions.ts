/**
 * Tokens soportados:
 * - Formato legado: @[Nombre](uid:firebaseUid)
 * - Formato visible (UI): @[Nombre](email)
 */
const MENTION_TOKEN_RE =
  /@\[([^\]]+)\]\((?:uid:([^)]+)|([^)]+))\)/g;

export function buildMentionToken(nombre: string, uid: string): string {
  return `@[${nombre}](uid:${uid})`;
}

export function buildMentionTokenEmail(nombre: string, email: string): string {
  return `@[${nombre}](${email})`;
}

export function parseMentions(
  text: string,
): Array<{ nombre: string; uid?: string; email?: string }> {
  const mentions: Array<{ nombre: string; uid?: string; email?: string }> = [];
  if (!text) return mentions;
  let match: RegExpExecArray | null;
  const re = new RegExp(MENTION_TOKEN_RE.source, 'g');
  while ((match = re.exec(text)) !== null) {
    const nombre = match[1];
    const uid = match[2];
    const raw = match[3];
    mentions.push({ nombre, uid, email: uid ? undefined : raw });
  }
  return mentions;
}

export function parseMencionadosUids(text: string): string[] {
  const uids = new Set<string>();
  for (const m of parseMentions(text)) {
    if (m.uid) uids.add(m.uid);
  }
  return [...uids];
}

/** Texto legible en historial (sin el uid embebido). */
export function formatObservacionesConMenciones(
  text: string,
  emailsByUid?: Record<string, string | undefined>,
): string {
  if (!text) return text;
  return text.replace(
    MENTION_TOKEN_RE,
    (_full, nombre: string, uid?: string, raw?: string) => {
      if (uid) {
        const email = emailsByUid?.[uid];
        return email ? `@[${nombre}](${email})` : `@[${nombre}]`;
      }
      return raw ? `@[${nombre}](${raw})` : `@[${nombre}]`;
    },
  );
}

export function getMentionQuery(
  text: string,
  cursor: number,
): { query: string; start: number } | null {
  const before = text.slice(0, cursor);
  const at = before.lastIndexOf('@');
  if (at === -1) return null;
  const between = before.slice(at + 1);
  if (between.includes('\n') || between.includes('[')) return null;
  return { query: between, start: at };
}
