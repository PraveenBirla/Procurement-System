import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import suppliersService from "../../../services/suppliersService";



export const SupplierReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const sups = await suppliersService.getAllSuppliers();
      if (sups && sups.length > 0) {
        // Compute real poCount and totalAmount if they exist, or default to 0 if not supported by backend
        const enriched = sups.map(s => ({
          ...s,
          poCount: s.poCount || 0,
          totalAmount: s.totalAmount || 0
        }));
        setData(enriched);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error("Failed to load suppliers", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Sort by amount for chart
  const chartData = [...data].sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 5);

  if (loading) return <div>Loading report...</div>;

  return (
    <div>
      <div className="report-section-header">
        <div className="report-section-title">Supplier Report</div>
        <div className="report-actions">
           <button className="btn-report-action primary" onClick={() => window.print()}>Export PDF</button>
        </div>
      </div>

      <div className="report-charts-grid">
        <div className="report-chart-card" style={{ gridColumn: '1 / -1' }}>
          <div className="report-chart-title">Top Suppliers by Purchase Amount</div>
          <div className="report-chart-wrapper" style={{ height: '400px' }}>
            {chartData.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--color-text-muted)' }}>
                No supplier data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="supplierName" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Bar dataKey="totalAmount" fill="#10b981" name="Total Purchase Amount" />
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
              <th>Supplier Name</th>
              <th>Category</th>
              <th>Email/Phone</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Total POs</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.map((sup) => (
              <tr key={sup.id}>
                <td style={{fontWeight: 600, color: "var(--color-text-primary)"}}>{sup.name || sup.supplierName}</td>
                <td>{sup.category || "General"}</td>
                <td>{sup.contact || sup.email || "N/A"}</td>
                <td>
                  <span style={{ color: sup.rating >= 4 ? '#16a34a' : '#ea580c', fontWeight: 600 }}>
                    ★ {sup.rating || "N/A"}
                  </span>
                </td>
                <td>
                  <span className={`badge ${sup.status === 'Inactive' ? 'rejected' : 'approved'}`}>
                    {sup.status || "Active"}
                  </span>
                </td>
                <td>{sup.poCount}</td>
                <td style={{fontWeight: 600}}>₹{sup.totalAmount?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
