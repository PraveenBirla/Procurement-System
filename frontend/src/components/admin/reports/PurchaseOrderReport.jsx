import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import purchaseOrderService from "../../../services/purchaseOrderService";



export const PurchaseOrderReport = () => {
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
        setData(pos);
      } else {
        setData([]); 
      }
    } catch (err) {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data: Total PO Amount by Supplier
  const supplierDataMap = data.reduce((acc, po) => {
    const s = po.supplierName || "Unknown";
    acc[s] = (acc[s] || 0) + po.totalAmount;
    return acc;
  }, {});

  const chartData = Object.keys(supplierDataMap).map(key => ({
    supplier: key,
    amount: supplierDataMap[key]
  }));

  if (loading) return <div>Loading report...</div>;

  return (
    <div>
      <div className="report-section-header">
        <div className="report-section-title">Purchase Order Report</div>
        <div className="report-actions">
           <button className="btn-report-action primary" onClick={() => window.print()}>Export PDF</button>
        </div>
      </div>

      <div className="report-charts-grid">
        <div className="report-chart-card" style={{ gridColumn: '1 / -1' }}>
          <div className="report-chart-title">Total Spend by Supplier</div>
          <div className="report-chart-wrapper" style={{ height: '400px' }}>
            {chartData.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--color-text-muted)' }}>
                No purchase order data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="supplier" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Bar dataKey="amount" fill="#3b82f6" name="Total Amount" />
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
              <th>PO Number</th>
              <th>Requisition</th>
              <th>Supplier</th>
              <th>Date</th>
              <th>Total Amount</th>
              <th>Expected Delivery</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((po) => (
              <tr key={po.id}>
                <td style={{fontWeight: 600, color: "#2563eb"}}>{po.poNumber}</td>
                <td>{po.reqNumber || "N/A"}</td>
                <td>{po.supplierName}</td>
                <td>{po.createdAt ? new Date(po.createdAt).toLocaleDateString() : ""}</td>
                <td>₹{po.totalAmount?.toLocaleString()}</td>
                <td>{po.expectedDelivery ? new Date(po.expectedDelivery).toLocaleDateString() : "N/A"}</td>
                <td>
                  <span className={`badge ${po.status === 'DELIVERED' ? 'approved' : 'pending'}`}>
                    {po.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
