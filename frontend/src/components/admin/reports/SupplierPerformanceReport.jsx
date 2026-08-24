import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import suppliersService from "../../../services/suppliersService";
import purchaseOrderService from "../../../services/purchaseOrderService";

export const SupplierPerformanceReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pos, suppliers] = await Promise.all([
        purchaseOrderService.getAll(),
        suppliersService.getAllSuppliers()
      ]);

      if (!pos || !suppliers) {
        setData([]);
        return;
      }

      const supplierMap = {};
      suppliers.forEach(s => {
        supplierMap[s.id] = {
          id: s.id,
          supplier: s.name,
          rating: s.rating || 0,
          totalPos: 0,
          deliveredPos: 0,
          lateDeliveries: 0, // Mocked as 0 for now since we don't have actual delivery dates
          cancelledPos: 0,
          completedPos: 0
        };
      });

      pos.forEach(po => {
        const sid = po.supplierId;
        if (supplierMap[sid]) {
          supplierMap[sid].totalPos++;
          if (po.status === 'COMPLETED' || po.status === 'DELIVERED') {
            supplierMap[sid].deliveredPos++;
            supplierMap[sid].completedPos++;
          }
          if (po.status === 'CANCELLED') {
            supplierMap[sid].cancelledPos++;
          }
        }
      });

      // Filter out suppliers with no POs for the chart
      const performanceData = Object.values(supplierMap).filter(s => s.totalPos > 0);
      setData(performanceData);
    } catch (err) {
      console.error("Failed to load supplier performance data", err);
      setData([]);
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
          <div className="report-chart-wrapper" style={{ height: '400px' }}>
            {data.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--color-text-muted)' }}>
                No supplier performance data available.
              </div>
            ) : (
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
            )}
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
