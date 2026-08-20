import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const mockPOStatusData = [
  { name: "GENERATED", count: 12 },
  { name: "SENT TO SUPPLIER", count: 8 },
  { name: "PO RECEIVED", count: 5 },
  { name: "IN DELIVERY", count: 4 },
  { name: "DELIVERED", count: 7 },
  { name: "COMPLETED", count: 20 },
  { name: "CANCELLED", count: 3 }
];

export const POStatusReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setData(mockPOStatusData);
      setLoading(false);
    }, 400);
  }, []);

  if (loading) return <div>Loading report...</div>;

  return (
    <div>
      <div className="report-section-header">
        <div className="report-section-title">Purchase Order Status Funnel</div>
        <div className="report-actions">
           <button className="btn-report-action primary" onClick={() => window.print()}>Export PDF</button>
        </div>
      </div>

      <div className="report-charts-grid">
        <div className="report-chart-card">
          <div className="report-chart-title">Purchase Orders by Status</div>
          <div className="report-chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 50 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'CANCELLED' ? '#ef4444' : entry.name === 'COMPLETED' ? '#10b981' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="report-table-wrapper">
        <table className="report-data-table">
          <thead>
            <tr>
              <th>Status Name</th>
              <th>Count of Purchase Orders</th>
              <th>Percentage of Total</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => {
              const total = data.reduce((sum, curr) => sum + curr.count, 0);
              const percentage = ((item.count / total) * 100).toFixed(1);
              return (
                <tr key={item.name}>
                  <td style={{fontWeight: 600, color: "var(--color-text-primary)"}}>{item.name}</td>
                  <td>{item.count}</td>
                  <td>{percentage}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
