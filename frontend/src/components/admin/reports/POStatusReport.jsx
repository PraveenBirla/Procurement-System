import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import purchaseOrderService from "../../../services/purchaseOrderService";

export const POStatusReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const pos = await purchaseOrderService.getAll();
      if (pos && pos.length > 0) {
        const counts = pos.reduce((acc, po) => {
          acc[po.status] = (acc[po.status] || 0) + 1;
          return acc;
        }, {});
        
        const chartData = Object.keys(counts).map(status => ({
          name: status,
          count: counts[status]
        }));
        
        setData(chartData);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error("Failed to load POs", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="report-chart-card" style={{ gridColumn: '1 / -1' }}>
          <div className="report-chart-title">Purchase Orders by Status</div>
          <div className="report-chart-wrapper" style={{ height: '400px' }}>
            {data.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--color-text-muted)' }}>
                No purchase order status data available.
              </div>
            ) : (
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
            )}
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
