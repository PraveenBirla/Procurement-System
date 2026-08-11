import { useState, useEffect } from "react";
import { Users, Building2, ShoppingCart, DollarSign, Clock } from "lucide-react";
import userService from "../../services/userService";
import suppliersService from "../../services/suppliersService";
import purchaseOrderService from "../../services/purchaseOrderService";
import "./OverviewSection.css";

export const OverviewSection = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalSuppliers: 0,
    totalPOs: 0,
    totalSpend: 0,
    recentPOs: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [users, suppliers, pos] = await Promise.all([
        userService.getUsers().catch(() => []),
        suppliersService.getAllSuppliers().catch(() => []),
        purchaseOrderService.getAll().catch(() => [])
      ]);

      const activeUsers = users?.filter(u => u.isActive) || [];
      const activeSuppliers = suppliers?.filter(s => s.isActive) || [];
      const validPOs = pos || [];

      // Calculate total spend from approved/delivered POs
      const totalSpend = validPOs
        .filter(po => po.status === 'APPROVED' || po.status === 'DELIVERED')
        .reduce((sum, po) => sum + (po.totalAmount || 0), 0);

      // Get 5 most recent POs
      const recentPOs = [...validPOs]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setMetrics({
        totalUsers: activeUsers.length,
        totalSuppliers: activeSuppliers.length,
        totalPOs: validPOs.length,
        totalSpend,
        recentPOs
      });
    } catch (error) {
      console.error("Failed to load dashboard metrics", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    if (!status) return 'status-default';
    const s = status.toLowerCase();
    if (s.includes('pending')) return 'status-pending';
    if (s.includes('approve')) return 'status-approved';
    if (s.includes('reject')) return 'status-rejected';
    if (s.includes('deliver')) return 'status-delivered';
    return 'status-default';
  };

  if (loading) {
    return <div className="loading-state">Loading dashboard data...</div>;
  }

  return (
    <div className="overview-section animate-fade-in">
      <div className="overview-header">
        <h2>Dashboard Overview</h2>
        <p>Welcome back! Here's what's happening in your procurement system today.</p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon blue">
            <Users size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-label">Active Users</div>
            <div className="metric-value">{metrics.totalUsers}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon amber">
            <Building2 size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-label">Active Suppliers</div>
            <div className="metric-value">{metrics.totalSuppliers}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon purple">
            <ShoppingCart size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-label">Total Purchase Orders</div>
            <div className="metric-value">{metrics.totalPOs}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon green">
            <DollarSign size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-label">Total Approved Spend</div>
            <div className="metric-value">
              ₹{metrics.totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      <div className="recent-activity-panel">
        <div className="panel-header">
          <h3>Recent Purchase Orders</h3>
          <Clock size={20} color="#64748b" />
        </div>
        
        {metrics.recentPOs.length === 0 ? (
          <div style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>
            No recent purchase orders found.
          </div>
        ) : (
          <div className="recent-list">
            {metrics.recentPOs.map(po => (
              <div className="recent-item" key={po.id}>
                <div className="recent-info">
                  <span className="recent-po">{po.poNumber}</span>
                  <span className="recent-supplier">Supplier: {po.supplierName}</span>
                </div>
                <div className="recent-meta">
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span className="recent-amount">
                      ₹{(po.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className={`status-badge ${getStatusClass(po.status)}`}>
                      {po.status || 'UNKNOWN'}
                    </span>
                  </div>
                  <span className="recent-date">
                    {po.createdAt ? new Date(po.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
