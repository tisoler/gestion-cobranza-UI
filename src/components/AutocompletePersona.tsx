import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

interface Option {
  id: number;
  nombre: string;
  esMatchAltaConfianza?: boolean;
}

interface AutocompleteProps {
  options: Option[];
  value: number | string;
  onChange: (id: number | null, nombre: string) => void;
  placeholder?: string;
  className?: string;
}

export function AutocompletePersona({ options, value, onChange, placeholder = "Buscar persona...", className = "" }: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = value ? options.find(opt => opt.id === Number(value)) : null;

  const filteredOptions = options.filter(opt =>
    opt.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="flex w-full items-center h-10 bg-background border border-border rounded-lg hover:border-primary transition-all shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex-grow flex items-center justify-between px-3 py-2 text-xs text-left cursor-pointer outline-none"
        >
          <span className={selectedOption ? "font-bold text-foreground" : "text-muted-foreground"}>
            {selectedOption ? selectedOption.nombre : placeholder}
          </span>
        </button>

        {selectedOption && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null, '');
              setSearchTerm('');
            }}
            className="p-1 mr-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Quitar selección"
          >
            <X className="size-3.5" />
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 mr-1 text-muted-foreground hover:text-foreground cursor-pointer outline-none"
        >
          <ChevronDown className={`size-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-[100] mt-1 w-full min-w-[300px] right-0 bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 border-b border-border bg-muted/30">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <input
                autoFocus
                className="w-full h-9 pl-9 pr-3 text-xs bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Escribe para filtrar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
            {/* Opción para quitar vinculación */}
            <button
              type="button"
              onClick={() => {
                onChange(null, '');
                setIsOpen(false);
                setSearchTerm('');
              }}
              className="flex w-full items-center px-3 py-2 text-xs rounded-lg transition-colors hover:bg-muted text-muted-foreground font-semibold italic text-left cursor-pointer border-b border-border/50 mb-1"
            >
              -- Sin vinculación / Quitar selección --
            </button>

            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onChange(opt.id, opt.nombre);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer ${
                    Number(value) === opt.id
                      ? 'bg-primary text-white font-bold'
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-left">{opt.nombre}</span>
                    {opt.esMatchAltaConfianza && (
                      <span className={`text-[9px] uppercase font-black tracking-tighter ${Number(value) === opt.id ? 'text-white/80' : 'text-emerald-600'}`}>
                        Sugerencia de confianza
                      </span>
                    )}
                  </div>
                  {Number(value) === opt.id && <Check className="size-3.5" />}
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-xs text-muted-foreground italic">
                No se encontraron personas
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
