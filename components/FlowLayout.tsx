import { Outlet } from 'react-router';
import { BookingProvider } from '../context/BookingContext';

export function FlowLayout() {
  return (
    <BookingProvider>
      <div className="relative min-h-screen overflow-hidden" style={{ backgroundColor: '#000007' }}>
        {/* Galactic Background */}
        <div className="fixed inset-0">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-blue-900/30 to-indigo-950/40" />
          
          {/* Animated glows */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-violet-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
          
          {/* Particle effect overlay */}
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 40% 20%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)`
          }} />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <Outlet />
        </div>
      </div>
    </BookingProvider>
  );
}
