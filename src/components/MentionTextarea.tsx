import { useCallback, useRef, useState } from 'react';
import type { UsuarioEntidad } from '../types';
import {
  buildMentionToken,
  buildMentionTokenEmail,
  getMentionQuery,
  parseMentions,
} from '../lib/mentions';

type MentionTextareaProps = {
  value: string;
  onChange: (value: string, mencionadosUids: string[]) => void;
  usuarios: UsuarioEntidad[];
  loading?: boolean;
  placeholder?: string;
  rows?: number;
  className?: string;
};

export function MentionTextarea({
  value,
  onChange,
  usuarios,
  loading = false,
  placeholder = 'Escribe los detalles aquí... Usá @ para mencionar a un colega.',
  rows = 3,
  className = '',
}: MentionTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionStart, setMentionStart] = useState(0);
  const [mentionQuery, setMentionQuery] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(0);

  const filtered = usuarios.filter((u) => {
    const q = mentionQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.nombre.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  const syncMentionState = useCallback(
    (text: string, cursor: number) => {
      const ctx = getMentionQuery(text, cursor);
      if (ctx) {
        setMentionOpen(true);
        setMentionStart(ctx.start);
        setMentionQuery(ctx.query);
        setHighlightIndex(0);
      } else {
        setMentionOpen(false);
        setMentionQuery('');
      }
    },
    [],
  );

  const emitChange = (text: string) => {
    const uidByEmail = new Map(
      usuarios
        .filter((u) => !!u.email)
        .map((u) => [u.email.toLowerCase(), u.uid]),
    );
    const uids = new Set<string>();
    for (const m of parseMentions(text)) {
      if (m.uid) uids.add(m.uid);
      else if (m.email) {
        const uid = uidByEmail.get(m.email.toLowerCase());
        if (uid) uids.add(uid);
      }
    }
    onChange(text, [...uids]);
  };

  const insertMention = (usuario: UsuarioEntidad) => {
    const el = textareaRef.current;
    if (!el) return;

    const cursor = el.selectionStart ?? value.length;
    const before = value.slice(0, mentionStart);
    const after = value.slice(cursor);
    const token = usuario.email
      ? buildMentionTokenEmail(usuario.nombre, usuario.email)
      : buildMentionToken(usuario.nombre, usuario.uid);
    const next = `${before}${token} ${after}`;
    emitChange(next);
    setMentionOpen(false);

    const newCursor = before.length + token.length + 1;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(newCursor, newCursor);
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    emitChange(text);
    syncMentionState(text, e.target.selectionStart);
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    syncMentionState(el.value, el.selectionStart);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === '@') {
      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (el) syncMentionState(el.value, el.selectionStart);
      });
    }

    if (!mentionOpen || filtered.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((i) => (i + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      insertMention(filtered[highlightIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setMentionOpen(false);
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onClick={(e) =>
          syncMentionState(
            e.currentTarget.value,
            e.currentTarget.selectionStart,
          )
        }
        rows={rows}
        disabled={loading}
        placeholder={placeholder}
        className={
          className ||
          'w-full rounded-xl border border-amber-500/20 bg-background px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-amber-500/10 outline-none resize-none disabled:opacity-50'
        }
      />

      {mentionOpen && (
        <ul
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-xl border border-border bg-card py-1 shadow-lg"
          role="listbox"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              Sin coincidencias
            </li>
          ) : (
            filtered.map((u, i) => (
              <li key={u.uid} role="option" aria-selected={i === highlightIndex}>
                <button
                  type="button"
                  className={`flex w-full flex-col px-3 py-2 text-left text-sm transition-colors hover:bg-primary/10 ${
                    i === highlightIndex ? 'bg-primary/10' : ''
                  }`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    insertMention(u);
                  }}
                  onMouseEnter={() => setHighlightIndex(i)}
                >
                  <span className="font-bold text-foreground">{u.nombre}</span>
                  {u.email && u.email !== u.nombre && (
                    <span className="text-xs text-muted-foreground">
                      {u.email}
                    </span>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
      )}

      <p className="ml-1 mt-1 text-[11px] font-medium text-muted-foreground">
        Escribí <span className="font-bold">@</span> para mencionar usuarios de
        tu entidad. Cada mención genera una notificación.
      </p>
    </div>
  );
}
