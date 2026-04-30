import { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../lib/firebase';
import { Mail, Lock, LogIn, AlertCircle, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.emailVerified) {
        setError('Tu cuenta aún no ha sido verificada. Revisa tu correo electrónico.');
        await signOut(auth);
        return;
      }

      navigate('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Correo o contraseña incorrectos.');
      } else {
        setError('Error al iniciar sesión. Verifique su correo y contraseña.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      
      // For Google users, we might still want to check (though usually verified)
      if (!userCredential.user.emailVerified) {
        setError('Tu cuenta de Google no está verificada. No puedes ingresar.');
        await signOut(auth);
        return;
      }

      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError('Error al iniciar sesión con Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      {/* Background blobs for vibrancy */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] size-[40%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] size-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute -bottom-[10%] left-[20%] size-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 p-8 shadow-2xl backdrop-blur-2xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/20 text-primary">
              <ShieldCheck className="size-8" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Sr. Cobranza</h1>
            <p className="mt-2 text-slate-400">Sistema de gestión de cobros</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
                <AlertCircle className="size-4" />
                <span>{error}</span>
              </div>
            )}

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
                  placeholder="••••••••"
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
                  <LogIn className="size-4" />
                  Iniciar Sesión
                </>
              )}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                <span className="bg-slate-900/50 px-2 text-slate-500 backdrop-blur-xl">O continuar con</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 py-3 font-bold text-white transition-all hover:bg-white/10 hover:border-white/20 active:scale-[0.98] disabled:opacity-50"
            >
              <svg className="size-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-4 border-t border-white/5 pt-6 text-sm">
            <p className="text-slate-400">
              ¿No tienes una cuenta?{' '}
              <Link to="/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                Regístrate gratis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
