import { Package } from 'lucide-react';

/**
 * AuthLayout — shared layout for Login and Register pages.
 * Desktop: left branding panel + right form panel.
 * Mobile: single column with compact header.
 */
export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex">
      {/* ── Left branding panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-120 xl:w-[520px] flex-col justify-between bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white p-10 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-1/2 right-10 w-40 h-40 rounded-full bg-white/5" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              ProCure
            </span>
          </div>
          <p className="text-primary-200 text-sm mt-1">
            Smart Procurement and Purchase Order Management System
          </p>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-6">
          <h1 className="text-3xl xl:text-4xl font-bold leading-tight tracking-tight">
            Streamline your procurement workflow
          </h1>
          <p className="text-primary-100 text-base leading-relaxed max-w-sm">
            Manage purchase requisitions, track orders, and collaborate with suppliers - all from one secure platform.
          </p>

          {/* Feature list */}
          <div className="space-y-3 pt-2">
            {[
              'Role-based access control',
              'Real-time order tracking',
              'Supplier management',
              'Budget monitoring',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-sm text-primary-100">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-300 flex-shrink-0" />
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-primary-300 text-xs">
            © {new Date().getFullYear()} ProCure. Secure & Trusted.
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col min-h-screen bg-page">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-2.5 px-6 py-4 border-b border-slate-200 bg-white">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Package className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-semibold text-slate-900 tracking-tight">
            ProCure
          </span>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-8 sm:py-12">
          <div className="w-full max-w-[440px] animate-fade-in">
            {/* Page heading */}
            {(title || subtitle) && (
              <div className="mb-8">
                {title && (
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
                )}
              </div>
            )}

            {/* Form content */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
