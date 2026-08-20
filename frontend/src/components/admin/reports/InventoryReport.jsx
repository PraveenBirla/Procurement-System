import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const mockInventoryData = [
  { id: 1, product: "ThinkPad T14", category: "Laptops", qtyOnHand: 15, underInspection: 2, quarantined: 0, warehouse: "WH-East", lastPo: "PO-001", lastUpdated: "2023-10-15" },
  { id: 2, product: "Dell Monitor 27\"", category: "Peripherals", qtyOnHand: 4, underInspection: 0, quarantined: 1, warehouse: "WH-West", lastPo: "PO-008", lastUpdated: "2023-10-10" },
  { id: 3, product: "Ergonomic Chair", category: "Furniture", qtyOnHand: 45, underInspection: 5, quarantined: 0, warehouse: "WH-East", lastPo: "PO-012", lastUpdated: "2023-09-20" },
  { id: 4, product: "Wireless Mouse", category: "Peripherals", qtyOnHand: 8, underInspection: 0, quarantined: 0, warehouse: "WH-Central", lastPo: "PO-015", lastUpdated: "2023-10-14" },
  { id: 5, product: "MacBook Pro", category: "Laptops", qtyOnHand: 2, underInspection: 0, quarantined: 0, warehouse: "WH-West", lastPo: "PO-003", lastUpdated: "2023-08-11" },
];

export const InventoryReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setData(mockInventoryData);
      setLoading(false);
    }, 400);
  }, []);

  if (loading) return <div>Loading report...</div>;

  return (
    <div>
      <div className="report-section-header">
        <div className="report-section-title">Inventory Report</div>
        <div className="report-actions">
           <button className="btn-report-action primary" onClick={() => window.print()}>Export PDF</button>
        </div>
      </div>

      <div className="report-charts-grid">
        <div className="report-chart-card">
          <div className="report-chart-title">Current Stock Levels (Highlighted &lt; 10 items)</div>
          <div className="report-chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="product" tick={{fontSize: 12}} interval={0} angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="qtyOnHand" name="Quantity on Hand">
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.qtyOnHand < 10 ? '#ef4444' : '#10b981'} />
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
              <th>Product</th>
              <th>Category</th>
              <th>Qty on Hand</th>
              <th>Under Inspection</th>
              <th>Quarantined</th>
              <th>Warehouse</th>
              <th>Last PO</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} style={{ backgroundColor: item.qtyOnHand < 10 ? '#fef2f2' : 'transparent' }}>
                <td style={{fontWeight: 600, color: "var(--color-text-primary)"}}>{item.product}</td>
                <td>{item.category}</td>
                <td>
                  <span style={{ fontWeight: 600, color: item.qtyOnHand < 10 ? '#dc2626' : '#16a34a'}}>
                    {item.qtyOnHand} {item.qtyOnHand < 10 && "(Low)"}
                  </span>
                </td>
                <td>{item.underInspection}</td>
                <td style={{ color: item.quarantined > 0 ? '#dc2626' : 'inherit' }}>{item.quarantined}</td>
                <td>{item.warehouse}</td>
                <td>{item.lastPo}</td>
                <td>{item.lastUpdated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
