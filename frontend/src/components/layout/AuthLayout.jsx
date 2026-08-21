import { Package } from 'lucide-react';

/**
 * AuthLayout — shared layout for Login and Register pages.
 * Desktop: left branding panel + right form panel.
 * Mobile: single column with compact header.
 */
export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex w-full">
      {/* ── Left branding panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-primary-700 bg-gradient-to-br from-primary-600 to-primary-900 dark:from-slate-800 dark:to-slate-950 text-white p-10 xl:p-16 relative overflow-hidden">
        
        {/* Subtle Decorative Elements */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl mix-blend-overlay animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-white/10 blur-3xl mix-blend-overlay animate-pulse" style={{ animationDuration: '8s' }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center shadow-md">
              <Package className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white drop-shadow-sm">
              ProCure
            </span>
          </div>
          <p className="text-primary-100/90 text-sm mt-1.5 font-semibold tracking-wide uppercase">
            Smart Procurement & PO Management
          </p>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-6 my-auto py-8">
          <h1 className="text-4xl xl:text-5xl font-extrabold leading-[1.15] tracking-tight text-white drop-shadow-sm">
            Streamline your <br/> procurement workflow.
          </h1>
          <p className="text-primary-50 text-base xl:text-lg leading-relaxed max-w-md font-medium opacity-90 drop-shadow-sm">
            Manage purchase requisitions, track orders, and collaborate with suppliers — all from one secure platform.
          </p>

          {/* Feature list */}
          <div className="space-y-4 pt-4">
            {[
              'Role-based access control',
              'Real-time order tracking',
              'Supplier management',
              'Budget monitoring',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-4 text-base font-semibold text-white/95">
                <div className="w-6 h-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center flex-shrink-0 shadow-inner">
                  <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,1)]" />
                </div>
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-primary-200/60 text-xs font-medium">
            © {new Date().getFullYear()} ProCure. Secure & Trusted.
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col min-h-screen bg-page relative overflow-hidden">
        
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-2.5 px-6 py-4 border-b border-borderLight bg-surface relative z-10">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Package className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-textPrimary tracking-tight">
            ProCure
          </span>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-8 sm:py-12 relative z-10">
          <div className="w-full max-w-[420px] animate-fade-in-scale">
            
            {/* Clean, Modern Form Card */}
            <div className="bg-surface border border-borderLight shadow-xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] rounded-2xl p-8 relative">
              
              {/* Page heading */}
              {(title || subtitle) && (
                <div className="mb-8">
                  {title && (
                    <h1 className="text-2xl font-bold text-textPrimary tracking-tight mb-1.5">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-sm text-textSecondary">{subtitle}</p>
                  )}
                </div>
              )}

              {/* Form content */}
              {children}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
