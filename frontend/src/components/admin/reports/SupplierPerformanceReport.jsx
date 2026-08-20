import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import suppliersService from "../../../services/suppliersService";

const mockPerformanceData = [
  { id: 1, supplier: "TechCorp", rating: 4.8, totalPos: 45, deliveredPos: 40, lateDeliveries: 2, cancelledPos: 1, completedPos: 37 },
  { id: 2, supplier: "OfficeSupplies Inc", rating: 4.2, totalPos: 120, deliveredPos: 110, lateDeliveries: 15, cancelledPos: 5, completedPos: 100 },
  { id: 3, supplier: "Global IT", rating: 4.9, totalPos: 30, deliveredPos: 30, lateDeliveries: 0, cancelledPos: 0, completedPos: 30 },
  { id: 4, supplier: "FastPrint", rating: 3.5, totalPos: 25, deliveredPos: 18, lateDeliveries: 8, cancelledPos: 3, completedPos: 14 },
];

export const SupplierPerformanceReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Typically would come from a dedicated performance endpoint
      setData(mockPerformanceData);
    } catch (err) {
      setData(mockPerformanceData);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading report...</div>;

  return (
    <div>
      <div className="report-section-header">
        <div className="report-section-title">Supplier Performance Report</div>
        <div className="report-actions">
           <button className="btn-report-action primary" onClick={() => window.print()}>Export PDF</button>
        </div>
      </div>

      <div className="report-charts-grid">
        <div className="report-chart-card" style={{ gridColumn: '1 / -1' }}>
          <div className="report-chart-title">Delivery Performance vs Total POs</div>
          <div className="report-chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="supplier" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="deliveredPos" name="Delivered On-Time" fill="#10b981" />
                <Bar dataKey="lateDeliveries" name="Late Deliveries" fill="#f59e0b" />
                <Bar dataKey="cancelledPos" name="Cancelled POs" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="report-table-wrapper">
        <table className="report-data-table">
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Rating</th>
              <th>Total POs</th>
              <th>Delivered POs</th>
              <th>Late Deliveries</th>
              <th>Cancelled POs</th>
              <th>Completed POs</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td style={{fontWeight: 600, color: "var(--color-text-primary)"}}>{item.supplier}</td>
                <td>
                  <span style={{ color: item.rating >= 4 ? '#16a34a' : '#ea580c', fontWeight: 600 }}>
                    ★ {item.rating}
                  </span>
                </td>
                <td>{item.totalPos}</td>
                <td style={{color: 'var(--color-success-500)', fontWeight: 500}}>{item.deliveredPos}</td>
                <td style={{color: item.lateDeliveries > 5 ? '#ef4444' : '#f59e0b', fontWeight: 500}}>{item.lateDeliveries}</td>
                <td style={{color: 'var(--color-danger-500)'}}>{item.cancelledPos}</td>
                <td>{item.completedPos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
