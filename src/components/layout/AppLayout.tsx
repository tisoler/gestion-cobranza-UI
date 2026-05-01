import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router-dom';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Sidebar />
      <main className="transition-all duration-300 min-h-screen">
        <div className="md:ml-20 has-[[data-collapsed=false]]:md:ml-64 transition-all duration-300 overflow-x-hidden">
           <Outlet />
        </div>
      </main>
    </div>
  );
}
