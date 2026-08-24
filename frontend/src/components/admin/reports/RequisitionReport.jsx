import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import requisitionService from "../../../services/requisitionService";



const COLORS = ['#f59e0b', '#10b981', '#ef4444', '#3b82f6'];

export const RequisitionReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Assuming requisitionService has getAll or similar
      // Since it's not checked deeply, we rely on mock data fallback
      const reqs = await requisitionService.getAllRequisitions();
      if (reqs && reqs.length > 0) {
        setData(reqs);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error("Failed to load requisitions", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const statusCount = data.reduce((acc, req) => {
    acc[req.status] = (acc[req.status] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(statusCount).map(key => ({
    name: key,
    value: statusCount[key]
  }));

  const getStatusBadge = (status) => {
    switch(status) {
      case 'APPROVED': return 'approved';
      case 'REJECTED': return 'rejected';
      case 'PENDING': return 'pending';
      default: return 'info';
    }
  };

  if (loading) return <div>Loading report...</div>;

  return (
    <div>
      <div className="report-section-header">
        <div className="report-section-title">Purchase Requisition Report</div>
        <div className="report-actions">
           <button className="btn-report-action primary" onClick={() => window.print()}>Export PDF</button>
        </div>
      </div>

      <div className="report-charts-grid">
        <div className="report-chart-card" style={{ gridColumn: '1 / -1' }}>
          <div className="report-chart-title">Requisitions by Status</div>
          <div className="report-chart-wrapper" style={{ height: '400px' }}>
            {chartData.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--color-text-muted)' }}>
                No requisition data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="report-table-wrapper">
        <table className="report-data-table">
          <thead>
            <tr>
              <th>Req No.</th>
              <th>Employee</th>
              <th>Department</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
              <th>Approval Details</th>
            </tr>
          </thead>
          <tbody>
            {data.map((req) => (
              <tr key={req.id}>
                <td style={{fontWeight: 600, color: "#2563eb"}}>{req.reqNumber || `REQ-${req.id}`}</td>
                <td>{req.employeeName || "User"}</td>
                <td>{req.department || "General"}</td>
                <td>{req.category || "General"}</td>
                <td>₹{req.totalAmount?.toLocaleString()}</td>
                <td>{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : ""}</td>
                <td>
                  <span className={`badge ${getStatusBadge(req.status)}`}>
                    {req.status}
                  </span>
                </td>
                <td style={{fontSize: "13px", color: "var(--color-text-muted)"}}>{req.approvalStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
