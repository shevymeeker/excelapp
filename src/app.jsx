import { useEffect, useState } from "react";
import localforage from "localforage";
import { saveAs } from "file-saver";
import materials from "./data/materials.json";
import equipment from "./data/equipment.json";
import "./index.css";

export default function App() {
  const [project, setProject] = useState({
    name: "",
    client: "",
    estimator: "",
    laborRate: 25,
    tax: 0.06,
    markup: 0.1,
    discount: 0.05,
    items: []
  });

  useEffect(() => {
    localforage.getItem("wildman-estimator").then(data => {
      if (data) setProject(data);
    });
  }, []);

  useEffect(() => {
    localforage.setItem("wildman-estimator", project);
  }, [project]);

  const addItem = () => {
    setProject(p => ({
      ...p,
      items: [
        ...p.items,
        {
          id: Date.now(),
          description: "",
          hours: 0,
          qty: 0,
          equipHours: 0,
          material: "",
          equipment: "",
          uom: "hr",
          notes: ""
        }
      ]
    }));
  };

  const updateItem = (id, field, value) => {
    setProject(p => ({
      ...p,
      items: p.items.map(i => (i.id === id ? { ...i, [field]: value } : i))
    }));
  };

  const clearAll = () =>
    setProject({
      ...project,
      items: []
    });

  const calcRow = item => {
    const mCost =
      item.material && materials.find(m => m.name === item.material)
        ? materials.find(m => m.name === item.material).unitCost
        : 0;
    const eCost =
      item.equipment && equipment.find(e => e.name === item.equipment)
        ? equipment.find(e => e.name === item.equipment).rate
        : 0;

    const labor = Number(item.hours) * project.laborRate;
    const materialTotal = Number(item.qty) * mCost;
    const equipTotal = Number(item.equipHours) * eCost;
    const total = labor + materialTotal + equipTotal;
    return { labor, materialTotal, equipTotal, total };
  };

  const subtotal = project.items.reduce((sum, i) => sum + calcRow(i).total, 0);
  const tax = subtotal * project.tax;
  const markup = subtotal * project.markup;
  const discount = subtotal * project.discount;
  const grandTotal = subtotal + tax + markup - discount;
  const margin =
    grandTotal > 0 ? ((grandTotal - subtotal) / grandTotal) * 100 : 0;

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(project, null, 2)], {
      type: "application/json"
    });
    saveAs(blob, `${project.name || "project"}_${Date.now()}.json`);
  };

  const importJSON = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const data = JSON.parse(evt.target.result);
      setProject(data);
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <header className="bg-gray-900 text-white p-4 text-center">
        <h1 className="text-xl font-bold">Wildman Tool Company</h1>
        <p className="text-sm">Digital tools that work where you work.</p>
      </header>

      <main className="p-4 space-y-4">
        <section className="grid gap-2 md:grid-cols-3">
          <input
            placeholder="Project Name"
            value={project.name}
            onChange={e =>
              setProject({ ...project, name: e.target.value })
            }
            className="input"
          />
          <input
            placeholder="Client"
            value={project.client}
            onChange={e =>
              setProject({ ...project, client: e.target.value })
            }
            className="input"
          />
          <input
            placeholder="Estimator"
            value={project.estimator}
            onChange={e =>
              setProject({ ...project, estimator: e.target.value })
            }
            className="input"
          />
        </section>

        <section className="grid gap-2 md:grid-cols-4">
          <label className="input-label">
            Labor Rate
            <input
              type="number"
              value={project.laborRate}
              onChange={e =>
                setProject({
                  ...project,
                  laborRate: parseFloat(e.target.value) || 0
                })
              }
              className="input"
            />
          </label>
          <label className="input-label">
            Tax %
            <input
              type="number"
              value={project.tax}
              onChange={e =>
                setProject({
                  ...project,
                  tax: parseFloat(e.target.value) || 0
                })
              }
              className="input"
            />
          </label>
          <label className="input-label">
            Markup %
            <input
              type="number"
              value={project.markup}
              onChange={e =>
                setProject({
                  ...project,
                  markup: parseFloat(e.target.value) || 0
                })
              }
              className="input"
            />
          </label>
          <label className="input-label">
            Discount %
            <input
              type="number"
              value={project.discount}
              onChange={e =>
                setProject({
                  ...project,
                  discount: parseFloat(e.target.value) || 0
                })
              }
              className="input"
            />
          </label>
        </section>

        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-lg">Items</h2>
          <button onClick={addItem} className="btn">
            + Add Item
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th>Description</th>
                <th>Hours</th>
                <th>Material</th>
                <th>Qty</th>
                <th>Equipment</th>
                <th>Equip Hrs</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {project.items.map(item => {
                const row = calcRow(item);
                return (
                  <tr key={item.id} className="border-b">
                    <td>
                      <input
                        value={item.description}
                        onChange={e =>
                          updateItem(item.id, "description", e.target.value)
                        }
                        className="input-table"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.hours}
                        onChange={e =>
                          updateItem(item.id, "hours", e.target.value)
                        }
                        className="input-table"
                      />
                    </td>
                    <td>
                      <select
                        value={item.material}
                        onChange={e =>
                          updateItem(item.id, "material", e.target.value)
                        }
                        className="input-table"
                      >
                        <option value="">--</option>
                        {materials.map(m => (
                          <option key={m.name}>{m.name}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.qty}
                        onChange={e =>
                          updateItem(item.id, "qty", e.target.value)
                        }
                        className="input-table"
                      />
                    </td>
                    <td>
                      <select
                        value={item.equipment}
                        onChange={e =>
                          updateItem(item.id, "equipment", e.target.value)
                        }
                        className="input-table"
                      >
                        <option value="">--</option>
                        {equipment.map(eq => (
                          <option key={eq.name}>{eq.name}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.equipHours}
                        onChange={e =>
                          updateItem(item.id, "equipHours", e.target.value)
                        }
                        className="input-table"
                      />
                    </td>
                    <td className="text-right pr-2">
                      {row.total.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <section className="mt-4 space-y-1 text-right">
          <div>Subtotal: ${subtotal.toFixed(2)}</div>
          <div>Tax: ${tax.toFixed(2)}</div>
          <div>Markup: ${markup.toFixed(2)}</div>
          <div>Discount: -${discount.toFixed(2)}</div>
          <div className="font-bold text-lg">
            Grand Total: ${grandTotal.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">
            Profit Margin: {margin.toFixed(1)}%
          </div>
        </section>

        <section className="flex flex-wrap gap-2 pt-4">
          <button onClick={clearAll} className="btn">
            New Project
          </button>
          <button onClick={exportJSON} className="btn">
            Export JSON
          </button>
          <label className="btn">
            Import JSON
            <input
              type="file"
              accept="application/json"
              onChange={importJSON}
              className="hidden"
            />
          </label>
        </section>
      </main>
    </div>
  );
}
