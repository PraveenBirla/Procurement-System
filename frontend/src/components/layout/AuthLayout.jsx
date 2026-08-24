import { BarChart3, Building2, CircleCheckBig, ClipboardList, FileText, Package, ShieldCheck, ShoppingCart, Store, Truck } from 'lucide-react';
import './AuthLayout.css';

export default function AuthLayout({ children, title, subtitle }) {
  const features = [
    { icon: ShoppingCart, title: 'Smart Requisition Management', text: 'Create and track purchase requests with ease.' },
    { icon: ShieldCheck, title: 'Multi-Level Approvals', text: 'Route requests to the right approvers automatically.' },
    { icon: Store, title: 'Supplier Management', text: 'Manage suppliers, products, and contracts efficiently.' },
    { icon: BarChart3, title: 'Real-Time Procurement Tracking', text: 'Track requests, approvals, orders, and deliveries.' },
  ];

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <aside className="auth-brand-panel">
          <div className="auth-brand-glow auth-brand-glow-top" />
          <div className="auth-brand-glow auth-brand-glow-bottom" />
          <div className="auth-brand-mark"><Package size={25} /><span>ProCure</span></div>
          <div className="auth-procurement-illustration" aria-hidden="true">
            <div className="auth-illustration-dashboard"><BarChart3 /><span /><span /></div>
            <ShoppingCart className="auth-illustration-cart" />
            <Truck className="auth-illustration-truck" />
          </div>
          <div className="auth-brand-copy">
            <p>WELCOME TO</p>
            <h1>ProCure</h1>
            <h2>Smarter Procurement.<br />Simpler Operations.</h2>
            <span>Manage requisitions, approvals, suppliers, purchase orders, and procurement operations from one secure platform.</span>
            <div className="auth-feature-grid">
              {features.map(({ icon: Icon, title: featureTitle, text }) => (
                <div className="auth-feature" key={featureTitle}>
                  <Icon aria-hidden="true" />
                  <div><strong>{featureTitle}</strong><small>{text}</small></div>
                </div>
              ))}
            </div>
            <div className="auth-workflow" aria-label="Procurement workflow">
              <h3>PROCUREMENT WORKFLOW</h3>
              <div className="auth-workflow-steps">
                <div><ClipboardList aria-hidden="true" /><span>Request</span></div><i aria-hidden="true" />
                <div><CircleCheckBig aria-hidden="true" /><span>Approval</span></div><i aria-hidden="true" />
                <div><FileText aria-hidden="true" /><span>Purchase Order</span></div><i aria-hidden="true" />
                <div><Building2 aria-hidden="true" /><span>Supplier</span></div><i aria-hidden="true" />
                <div><Truck aria-hidden="true" /><span>Delivery</span></div>
              </div>
            </div>
          </div>
          <div className="auth-security-note"><ShieldCheck aria-hidden="true" /><div><strong>Secure. Reliable. Trusted.</strong><span>Your procurement data is always protected.</span></div></div>
          <small>© {new Date().getFullYear()} ProCure. Secure & trusted.</small>
        </aside>
        <section className="auth-form-panel">
          <div className="auth-mobile-brand"><Package size={20} /><span>ProCure</span></div>
          <div className="auth-form-content animate-fade-in-scale">
            {(title || subtitle) && <div className="auth-form-heading">
              {title && <h1>{title}</h1>}
              {subtitle && <p>{subtitle}</p>}
            </div>}
            {children}
          </div>
        </section>
      </section>
    </main>
  );
}
