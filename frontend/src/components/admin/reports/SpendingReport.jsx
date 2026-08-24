import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import reportService from "../../../services/reportService";

const mockSpendingData = {
  summary: {
    total: 1250000,
    approved: 850000,
    pending: 250000,
    rejected: 150000,
    completed: 650000
  },
  byDepartment: [
    { name: "Engineering", approved: 350000, pending: 100000, rejected: 50000 },
    { name: "Marketing", approved: 120000, pending: 50000, rejected: 20000 },
    { name: "Operations", approved: 200000, pending: 80000, rejected: 30000 },
    { name: "HR", approved: 80000, pending: 20000, rejected: 10000 },
    { name: "Sales", approved: 100000, pending: 0, rejected: 40000 }
  ]
};

export const SpendingReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const loadReport = async () => {

        try {

            setLoading(true);

            const response = await reportService.getSpendingReport();

            setData(response);

        } catch (error) {

            console.error(
                "Failed to load spending report:",
                error
            );

        } finally {

            setLoading(false);
        }
    };

    loadReport();

}, []);

  if (loading || !data) return <div>Loading report...</div>;

  return (
    <div>
      <div className="report-section-header">
        <div className="report-section-title">Spending & Procurement Report</div>
        <div className="report-actions">
           <button className="btn-report-action primary" onClick={() => window.print()}>Export PDF</button>
        </div>
      </div>

      <div className="summary-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="report-chart-card">
          <div style={{fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px'}}>Total Procurement</div>
          <div style={{fontSize: '24px', fontWeight: 'bold', color: 'var(--color-text-primary)'}}>₹{data.summary.total.toLocaleString()}</div>
        </div>
        <div className="report-chart-card">
          <div style={{fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px'}}>Approved Amount</div>
          <div style={{fontSize: '24px', fontWeight: 'bold', color: '#16a34a'}}>₹{data.summary.approved.toLocaleString()}</div>
        </div>
        <div className="report-chart-card">
          <div style={{fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px'}}>Pending Amount</div>
          <div style={{fontSize: '24px', fontWeight: 'bold', color: '#d97706'}}>₹{data.summary.pending.toLocaleString()}</div>
        </div>
        <div className="report-chart-card">
          <div style={{fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px'}}>Rejected Amount</div>
          <div style={{fontSize: '24px', fontWeight: 'bold', color: '#dc2626'}}>₹{data.summary.rejected.toLocaleString()}</div>
        </div>
      </div>

      <div className="report-charts-grid">
        <div className="report-chart-card" style={{ gridColumn: '1 / -1' }}>
          <div className="report-chart-title">Spending Breakdown by Department</div>
          <div className="report-chart-wrapper" style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byDepartment} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="approved" stackId="a" fill="#10b981" name="Approved" />
                <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending" />
                <Bar dataKey="rejected" stackId="a" fill="#ef4444" name="Rejected" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
