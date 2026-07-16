import { useNavigate } from 'react-router-dom';
import {
  Package,
  LogOut,
  FileText,
  ShoppingCart,
  Users,
  BarChart3,
  TrendingUp,
  Clock,
  DollarSign,
  Truck,
  ClipboardList,
  Settings,
  Bell,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../constants/roles';

/**
 * Get the human-readable label for a role value.
 */
function getRoleLabel(roleValue) {
  return ROLES.find((r) => r.value === roleValue)?.label || roleValue;
}

/**
 * Format today's date nicely.
 */
function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Generate initials from a name.
 */
function getInitials(name) {
  if (!name) return '??';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ── Mock statistics data ──
const stats = [
  {
    label: 'Pending Requests',
    value: '12',
    change: '+3 this week',
    icon: ClipboardList,
    color: 'text-amber-600 bg-amber-50',
  },
  {
    label: 'Active Orders',
    value: '28',
    change: '+5 this month',
    icon: ShoppingCart,
    color: 'text-primary-600 bg-primary-50',
  },
  {
    label: 'Budget Utilized',
    value: '68%',
    change: '$45.2K remaining',
    icon: DollarSign,
    color: 'text-emerald-600 bg-emerald-50',
  },
  {
    label: 'Suppliers',
    value: '34',
    change: '2 new this month',
    icon: Truck,
    color: 'text-violet-600 bg-violet-50',
  },
];

// ── Quick action cards ──
const quickActions = [
  {
    title: 'Create Requisition',
    description: 'Submit a new purchase request',
    icon: FileText,
    color: 'text-primary-600 bg-primary-50',
  },
  {
    title: 'View Orders',
    description: 'Track purchase order status',
    icon: ShoppingCart,
    color: 'text-emerald-600 bg-emerald-50',
  },
  {
    title: 'Manage Suppliers',
    description: 'Review and onboard suppliers',
    icon: Users,
    color: 'text-violet-600 bg-violet-50',
  },
  {
    title: 'Reports',
    description: 'Generate procurement analytics',
    icon: BarChart3,
    color: 'text-amber-600 bg-amber-50',
  },
];

// ── Recent activity placeholder ──
const recentActivity = [
  {
    id: 1,
    text: 'Purchase requisition #PR-1024 submitted',
    time: '2 hours ago',
    type: 'info',
  },
  {
    id: 2,
    text: 'Order #PO-3821 approved by Manager',
    time: '5 hours ago',
    type: 'success',
  },
  {
    id: 3,
    text: 'Supplier Acme Corp. document pending review',
    time: '1 day ago',
    type: 'warning',
  },
  {
    id: 4,
    text: 'Budget alert: Engineering Dept. at 85%',
    time: '2 days ago',
    type: 'danger',
  },
  {
    id: 5,
    text: 'New supplier TechParts Ltd. onboarded',
    time: '3 days ago',
    type: 'success',
  },
];

const activityDot = {
  info: 'bg-primary-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully', {
      style: {
        background: '#F0F9FF',
        color: '#0C4A6E',
        border: '1px solid #BAE6FD',
      },
    });
    navigate('/login');
  };

  const userName = user?.fullName || 'User';
  const userRole = user?.role || 'EMPLOYEE';
  const userEmail = user?.email || 'user@company.com';

  return (
    <div className="min-h-screen bg-page">
      {/* ── Top navigation ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <Container maxWidth="xl">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-slate-900 tracking-tight">
                ProCure
              </span>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              <button
                className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <button
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Settings"
              >
                <Settings className="h-5 w-5" />
              </button>
              <div className="w-px h-6 bg-slate-200 mx-1" />
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<LogOut className="h-4 w-4" />}
                onClick={handleLogout}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </Container>
      </header>

      {/* ── Main content ── */}
      <main className="py-8">
        <Container maxWidth="xl" className="space-y-8">
          {/* ── Welcome card ── */}
          <Card className="bg-gradient-to-r from-primary-600 to-primary-700 border-none text-white animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-primary-200 text-sm">
                  {formatDate()}
                </p>
                <h1 className="text-2xl font-bold mt-1 tracking-tight">
                  Good{' '}
                  {new Date().getHours() < 12
                    ? 'morning'
                    : new Date().getHours() < 17
                      ? 'afternoon'
                      : 'evening'}
                  , {userName.split(' ')[0]}!
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    role={userRole}
                    className="!bg-white/20 !text-white"
                    size="sm"
                  >
                    {getRoleLabel(userRole)}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-primary-200" />
                <span className="text-sm text-primary-100">
                  3 tasks need your attention
                </span>
              </div>
            </div>
          </Card>

          {/* ── Statistics grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
            {stats.map((stat) => {
              const IconComp = stat.icon;
              return (
                <Card key={stat.label} hover className="group">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-500">{stat.label}</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        {stat.value}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {stat.change}
                      </p>
                    </div>
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}
                    >
                      <IconComp className="h-5 w-5" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* ── Quick actions + Recent activity ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions — 2 cols */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
                {quickActions.map((action) => {
                  const IconComp = action.icon;
                  return (
                    <Card
                      key={action.title}
                      hover
                      className="cursor-pointer group"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${action.color}`}
                        >
                          <IconComp className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-slate-900">
                              {action.title}
                            </h3>
                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity — 1 col */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Recent Activity
              </h2>
              <Card padding="sm" className="animate-fade-in">
                <div className="divide-y divide-slate-100">
                  {recentActivity.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 py-3 first:pt-1 last:pb-1"
                    >
                      <div className="mt-1.5 flex-shrink-0">
                        <div
                          className={`w-2 h-2 rounded-full ${activityDot[item.type]}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 leading-snug">
                          {item.text}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* ── Profile card ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="animate-fade-in">
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="w-16 h-16 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xl font-bold mb-3">
                  {getInitials(userName)}
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {userName}
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">{userEmail}</p>
                <Badge role={userRole} className="mt-2">
                  {getRoleLabel(userRole)}
                </Badge>
                <p className="text-xs text-slate-400 mt-3">
                  Member since{' '}
                  {new Date().toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </Card>
          </div>
        </Container>
      </main>
    </div>
  );
}
