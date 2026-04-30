import { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { Mail, Lock, UserPlus, AlertCircle, User, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Send verification email
      await sendEmailVerification(userCredential.user);

      setSuccess('¡Cuenta creada! Por favor, verifica tu correo electrónico antes de iniciar sesión.');

      // Sign out to force verification on login
      await signOut(auth);

      // Optional: clear form
      setEmail('');
      setPassword('');
      setNombre('');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('El correo electrónico ya está en uso.');
      } else {
        setError('Error al crear la cuenta. Intente con otro correo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -bottom-[10%] -right-[10%] size-[40%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute top-[20%] -left-[10%] size-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 p-8 shadow-2xl backdrop-blur-2xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/20 text-primary">
              <ShieldCheck className="size-8" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Registro</h1>
            <p className="mt-2 text-slate-400">Únete al equipo de gestión</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
                <AlertCircle className="size-4" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2 rounded-lg bg-emerald-500/10 p-4 text-sm text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="size-5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="group space-y-1.5">
              <label className="text-sm font-medium text-slate-200 transition-colors group-focus-within:text-primary">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-primary" />
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-800/50 py-2.5 pl-10 pr-4 text-white placeholder-slate-500 transition-all focus:border-primary/50 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  placeholder="Juan Pérez"
                  required
                />
              </div>
            </div>

            <div className="group space-y-1.5">
              <label className="text-sm font-medium text-slate-200 transition-colors group-focus-within:text-primary">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-primary" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-800/50 py-2.5 pl-10 pr-4 text-white placeholder-slate-500 transition-all focus:border-primary/50 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  placeholder="ejemplo@correo.com"
                  required
                />
              </div>
            </div>

            <div className="group space-y-1.5">
              <label className="text-sm font-medium text-slate-200 transition-colors group-focus-within:text-primary">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-primary" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-800/50 py-2.5 pl-10 pr-4 text-white placeholder-slate-500 transition-all focus:border-primary/50 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-primary py-3 font-semibold text-white transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
            >
              <div className="absolute inset-0 flex translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" />
              {loading ? (
                <div className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <UserPlus className="size-4" />
                  Crear Cuenta
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-4 border-t border-white/5 pt-6 text-sm">
            <p className="text-slate-400">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
