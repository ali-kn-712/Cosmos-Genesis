const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[ch]));

const inputMarkup = (field, record) => {
  const value = record?.[field.name];
  const required = field.required ? "required" : "";
  const common = `name="${field.name}" ${required}`;
  if (field.type === "textarea" || field.type === "json") {
    const content = field.type === "json" ? JSON.stringify(value ?? field.defaultValue ?? (field.multiple ? [] : {}), null, 2) : value ?? "";
    return `<label>${field.label}<textarea ${common} rows="${field.rows || (field.type === "json" ? 7 : 3)}" placeholder="${esc(field.placeholder || "")}">${esc(content)}</textarea></label>`;
  }
  if (field.type === "select") {
    return `<label>${field.label}<select ${common}>${(field.options || []).map(option => `<option value="${esc(option.value)}" ${String(value ?? field.defaultValue ?? "") === String(option.value) ? "selected" : ""}>${esc(option.label)}</option>`).join("")}</select></label>`;
  }
  if (field.type === "checkbox") {
    return `<label><input type="checkbox" name="${field.name}" ${value === true ? "checked" : ""}> ${field.label}</label>`;
  }
  let shown = value ?? field.defaultValue ?? "";
  if (field.type === "datetime-utc" && shown) {
    const date = new Date(shown);
    shown = `${date.getUTCFullYear()}-${String(date.getUTCMonth()+1).padStart(2,"0")}-${String(date.getUTCDate()).padStart(2,"0")}T${String(date.getUTCHours()).padStart(2,"0")}:${String(date.getUTCMinutes()).padStart(2,"0")}`;
  } else if (field.type === "date" && shown) shown = String(shown).slice(0,10);
  return `<label>${field.label}<input ${common} type="${field.type === "datetime-utc" ? "datetime-local" : field.type || "text"} value="${esc(shown)}" placeholder="${esc(field.placeholder || "")}" ${field.min != null ? `min="${field.min}"` : ""}></label>`;
};

export async function mountAdminCrud({
  root,
  service,
  title,
  description = "",
  singular,
  columns,
  fields,
  emptyLabel = "No records yet.",
  toPayload = values => values,
  formatCell = value => esc(value || "—")
}) {
  let rows = [];
  let editingId = null;
  const listRoot = () => root.querySelector("[data-crud-list]");
  const formRoot = () => root.querySelector("[data-crud-form]");

  const paint = () => {
    const headers = columns.map(column => `<th>${column.label}</th>`).join("");
    const body = rows.map(record => `<tr>${columns.map(column => `<td>${column.render ? column.render(record[column.key], record) : formatCell(record[column.key])}</td>`).join("")}<td><button type="button" data-crud-edit="${esc(record.id)}">Edit</button> <button type="button" data-crud-delete="${esc(record.id)}">Delete</button></td></tr>`).join("");
    listRoot().innerHTML = `<div class="tw"><table><thead><tr>${headers}<th></th></tr></thead><tbody>${body || `<tr><td colspan="${columns.length+1}">${emptyLabel}</td></tr>`}</tbody></table></div>`;
  };

  const showForm = async id => {
    editingId = id || null;
    const record = id ? rows.find(item => String(item.id) === String(id)) || await service.get(id) : {};
    formRoot().innerHTML = `<form class="fields" data-crud-editor style="margin-top:2rem"><h2>${id ? "Edit " : "New "}${singular}</h2>${fields.map(field => inputMarkup(field, record)).join("")}<div><button class="btn">${id ? "Save changes" : "Create"}</button> <button class="btn ghost" type="button" data-crud-cancel>Cancel</button></div><p class="mut" role="status" data-crud-error></p></form>`;
  };

  root.innerHTML = `<section class="wrap pt"><div style="display:flex;justify-content:space-between;align-items:center;gap:1rem"><h1>${title}</h1><button class="btn" type="button" data-crud-new>New ${singular}</button></div>${description ? `<p class="mut">${description}</p>` : ""}<div data-crud-list></div><div data-crud-form></div></section>`;
  try {
    rows = await service.list();
    paint();
  } catch (error) {
    listRoot().innerHTML = `<p class="mut" role="alert">${esc(error.message || "Could not load records.")}</p>`;
  }

  root.onclick = async event => {
    const button = event.target.closest("button");
    if (!button || !root.contains(button)) return;
    try {
      if (button.hasAttribute("data-crud-new")) await showForm(null);
      else if (button.dataset.crudEdit) await showForm(button.dataset.crudEdit);
      else if (button.dataset.crudCancel) { formRoot().innerHTML = ""; editingId = null; }
      else if (button.dataset.crudDelete && confirm(`Permanently delete this ${singular}?`)) {
        await service.remove(button.dataset.crudDelete);
        rows = await service.list(); paint(); formRoot().innerHTML = "";
      }
    } catch (error) { toast(error.message || "Request failed."); }
  };

  root.onsubmit = async event => {
    const form = event.target.closest("[data-crud-editor]");
    if (!form) return;
    event.preventDefault();
    const button = form.querySelector('button:not([type="button"])');
    const status = form.querySelector("[data-crud-error]");
    button.disabled = true; status.textContent = "Saving…";
    try {
      const values = {};
      for (const field of fields) {
        const control = form.elements[field.name];
        if (field.type === "checkbox") values[field.name] = control.checked;
        else if (field.type === "json") values[field.name] = JSON.parse(control.value || (field.multiple ? "[]" : "{}"));
        else values[field.name] = control.value;
      }
      const payload = toPayload(values);
      if (editingId) await service.update(editingId, payload);
      else await service.create(payload);
      rows = await service.list(); paint(); formRoot().innerHTML = "";
      toast(`${singular} saved.`);
    } catch (error) {
      status.textContent = error.message || "Could not save record.";
      button.disabled = false;
    }
  };
}
