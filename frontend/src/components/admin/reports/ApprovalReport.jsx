import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const mockApprovalData = [
  { id: 1, req: "REQ-001", employee: "Alice Smith", managerDecision: "Approved", financeDecision: "Approved", procurementDecision: "Approved", currentApprover: "System", date: "2023-10-15", remarks: "All good" },
  { id: 2, req: "REQ-002", employee: "Bob Jones", managerDecision: "Approved", financeDecision: "Pending", procurementDecision: "-", currentApprover: "Finance Team", date: "2023-10-16", remarks: "Awaiting budget check" },
  { id: 3, req: "REQ-003", employee: "Charlie Davis", managerDecision: "Rejected", financeDecision: "-", procurementDecision: "-", currentApprover: "-", date: "2023-10-14", remarks: "Budget exceeded" },
  { id: 4, req: "REQ-004", employee: "Diana Evans", managerDecision: "Approved", financeDecision: "Approved", procurementDecision: "Pending", currentApprover: "Procurement Manager", date: "2023-10-17", remarks: "Ready for PO" },
];

const mockChartData = [
  { date: "Oct 10", avgTimeHours: 12 },
  { date: "Oct 11", avgTimeHours: 14 },
  { date: "Oct 12", avgTimeHours: 8 },
  { date: "Oct 13", avgTimeHours: 24 },
  { date: "Oct 14", avgTimeHours: 18 },
  { date: "Oct 15", avgTimeHours: 10 },
  { date: "Oct 16", avgTimeHours: 6 },
];

export const ApprovalReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setData(mockApprovalData);
      setLoading(false);
    }, 400);
  }, []);

  const getDecisionBadge = (decision) => {
    if (decision === 'Approved') return 'approved';
    if (decision === 'Rejected') return 'rejected';
    if (decision === 'Pending') return 'pending';
    return '';
  };

  if (loading) return <div>Loading report...</div>;

  return (
    <div>
      <div className="report-section-header">
        <div className="report-section-title">Approval Workflow Report</div>
        <div className="report-actions">
           <button className="btn-report-action primary" onClick={() => window.print()}>Export PDF</button>
        </div>
      </div>

      <div className="report-charts-grid">
        <div className="report-chart-card">
          <div className="report-chart-title">Average Approval Time (Hours)</div>
          <div className="report-chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="avgTimeHours" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="report-table-wrapper">
        <table className="report-data-table">
          <thead>
            <tr>
              <th>Requisition</th>
              <th>Employee</th>
              <th>Manager Decision</th>
              <th>Finance Decision</th>
              <th>Procurement Decision</th>
              <th>Current Approver</th>
              <th>Date</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td style={{fontWeight: 600, color: "#2563eb"}}>{item.req}</td>
                <td>{item.employee}</td>
                <td>
                  <span className={`badge ${getDecisionBadge(item.managerDecision)}`}>{item.managerDecision}</span>
                </td>
                <td>
                  <span className={`badge ${getDecisionBadge(item.financeDecision)}`}>{item.financeDecision}</span>
                </td>
                <td>
                  <span className={`badge ${getDecisionBadge(item.procurementDecision)}`}>{item.procurementDecision}</span>
                </td>
                <td style={{fontWeight: 500}}>{item.currentApprover}</td>
                <td>{item.date}</td>
                <td style={{fontSize: "13px", color: "#64748b"}}>{item.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
