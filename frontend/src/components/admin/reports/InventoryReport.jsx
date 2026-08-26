import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import inventoryService from "../../../services/inventoryService";

export const InventoryReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const items = await inventoryService.getAllInventory();
      if (items && items.length > 0) {
        setData(items);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error("Failed to load inventory", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="report-chart-card" style={{ gridColumn: '1 / -1' }}>
          <div className="report-chart-title">Current Stock Levels (Highlighted &lt; 10 items)</div>
          <div className="report-chart-wrapper" style={{ height: '400px' }}>
            {data.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--color-text-muted)' }}>
                No inventory data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 55 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="productName" tick={{fontSize: 12}} interval={0} angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantityOnHand" name="Quantity on Hand">
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.quantityOnHand < 10 ? '#ef4444' : '#10b981'} />
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
              <tr key={item.id} style={{ backgroundColor: item.quantityOnHand < 10 ? '#fef2f2' : 'transparent' }}>
                <td style={{fontWeight: 600, color: "var(--color-text-primary)"}}>{item.productName}</td>
                <td>{item.category || "-"}</td>
                <td>
                  <span style={{ fontWeight: 600, color: item.quantityOnHand < 10 ? '#dc2626' : '#16a34a'}}>
                    {item.quantityOnHand} {item.quantityOnHand < 10 && "(Low)"}
                  </span>
                </td>
                <td>{item.underInspection || "0"}</td>
                <td style={{ color: item.quarantined > 0 ? '#dc2626' : 'inherit' }}>{item.quarantined || "0"}</td>
                <td>{item.warehouseLocation || "-"}</td>
                <td>{item.purchaseOrderNo || "-"}</td>
                <td>{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
