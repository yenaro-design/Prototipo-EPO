
// ==========================================
// EPO CONTROL - PROTOTIPO DE BAJA FIDELIDAD
// ==========================================

// DATOS DE DEMOSTRACIÓN

let materials = [
    {id:"MP-001", name:"Film plástico", category:"Materia prima", qty:1000, unit:"kg", location:"A-1"},
    {id:"MP-002", name:"Polietileno", category:"Materia prima", qty:2500, unit:"kg", location:"A-2"},
    {id:"MP-003", name:"Polipropileno", category:"Materia prima", qty:1800, unit:"kg", location:"A-3"},
    {id:"EM-001", name:"Bolsa industrial", category:"Empaque", qty:3200, unit:"und", location:"B-1"},
    {id:"EM-002", name:"Rollo stretch", category:"Empaque", qty:450, unit:"kg", location:"B-2"},
    {id:"PT-001", name:"Empaque terminado A", category:"Producto terminado", qty:2100, unit:"und", location:"C-1"},
    {id:"PT-002", name:"Empaque terminado B", category:"Producto terminado", qty:950, unit:"und", location:"C-2"},
    {id:"MP-004", name:"Tinta industrial", category:"Materia prima", qty:500, unit:"kg", location:"A-4"}
];

let movements = [
    {date:"19/11/2026", type:"Entrada", material:"Film plástico", qty:1000, unit:"kg", detail:"Plasticolor S.A.", user:"Administrador"},
    {date:"18/11/2026", type:"Salida", material:"Polietileno", qty:300, unit:"kg", detail:"Producción", user:"Operario"},
    {date:"18/11/2026", type:"Entrada", material:"Bolsa industrial", qty:800, unit:"und", detail:"Empaques del Valle", user:"Almacén"},
    {date:"17/11/2026", type:"Salida", material:"Film plástico", qty:500, unit:"kg", detail:"Producción", user:"Operario"}
];

let issues = [
    {material:"Film plástico", qty:200, unit:"kg", status:"Defectuoso"},
    {material:"Tinta industrial", qty:25, unit:"kg", status:"Pendiente de revisión"}
];

let surpluses = [
    {material:"Film plástico", qty:150, unit:"kg", status:"Reutilizable"},
    {material:"Polietileno", qty:390, unit:"kg", status:"Reutilizable"}
];

let activity = [
    ["Entrada registrada", "Film plástico · 1.000 kg", "Hoy"],
    ["Salida registrada", "Polietileno · 300 kg", "Ayer"],
    ["Novedad de calidad", "Film plástico · 200 kg", "Ayer"]
];

let currentForm = "";

const $ = id => document.getElementById(id);

function formatNumber(number) {
    return Number(number).toLocaleString("es-CO");
}

function totalStock() {
    return materials.reduce((sum, m) => sum + m.qty, 0);
}

function today() {
    return new Date().toLocaleDateString("es-CO");
}

// ==========================================
// NAVEGACIÓN
// ==========================================

function showPage(page) {

    document.querySelectorAll(".page").forEach(section => {
        section.classList.remove("active");
    });

    document.getElementById(page).classList.add("active");

    document.querySelectorAll(".nav-btn").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.page === page
        );
    });

    const titles = {
        dashboard: "Panel principal",
        inventory: "Inventario",
        movements: "Movimientos",
        quality: "Calidad y sobrantes",
        reports: "Reportes"
    };

    $("page-title").textContent = titles[page];

    renderAll();
}

document.querySelectorAll(".nav-btn").forEach(button => {
    button.addEventListener("click", () => {
        showPage(button.dataset.page);
    });
});

// ==========================================
// ACTUALIZACIÓN DEL PANEL PRINCIPAL
// ==========================================

function renderDashboard() {

    $("total-materials").textContent = materials.length;

    $("total-stock").textContent = formatNumber(totalStock());

    $("total-issues").textContent = issues.length;

    const totalSurplus = surpluses.reduce(
        (sum, item) => sum + item.qty, 0
    );

    $("total-surplus").textContent =
        formatNumber(totalSurplus) + " kg";

    $("recent-activity").innerHTML = activity.slice(0, 6)
        .map(item => `
            <div class="activity-item">
                <b>${item[0]}</b>
                <div>${item[1]}</div>
                <small>${item[2]}</small>
            </div>
        `).join("");
}

// ==========================================
// INVENTARIO
// ==========================================

function renderInventory() {

    const search = $("inventory-search").value.toLowerCase();

    const category = $("category-filter").value;

    const filtered = materials.filter(material => {

        const matchesSearch =
            material.name.toLowerCase().includes(search) ||
            material.id.toLowerCase().includes(search) ||
            material.location.toLowerCase().includes(search);

        const matchesCategory =
            !category || material.category === category;

        return matchesSearch && matchesCategory;
    });

    $("inventory-table").innerHTML = filtered.length
        ? filtered.map(material => {

            const status = material.qty < 500 ? "Stock bajo" : "Disponible";

            const badge = material.qty < 500 ? "low" : "available";

            return `
                <tr>
                    <td>
                        <b>${material.name}</b>
                        <br><small>${material.id}</small>
                    </td>
                    <td>${material.category}</td>
                    <td><b>${formatNumber(material.qty)} ${material.unit}</b></td>
                    <td>📍 ${material.location}</td>
                    <td><span class="badge ${badge}">${status}</span></td>
                    <td>
                        <button class="btn secondary"
                            onclick="quickMovement('${material.id}')">
                            + Movimiento
                        </button>
                    </td>
                </tr>
            `;
        }).join("")
        : `<tr><td colspan="6">No se encontraron materiales.</td></tr>`;
}

// ==========================================
// MOVIMIENTOS
// ==========================================

function renderMovements() {

    const search = $("movement-search").value.toLowerCase();

    const filter = $("movement-filter").value;

    const filtered = movements.filter(item => {

        const matchesSearch =
            item.material.toLowerCase().includes(search) ||
            item.detail.toLowerCase().includes(search);

        const matchesType =
            !filter || item.type === filter;

        return matchesSearch && matchesType;
    });

    $("movement-table").innerHTML = filtered.length
        ? filtered.map(item => `
            <tr>
                <td>${item.date}</td>
                <td>
                    <span class="${item.type === "Entrada" ? "entry" : "exit"}">
                        ${item.type}
                    </span>
                </td>
                <td><b>${item.material}</b></td>
                <td>${item.type === "Entrada" ? "+" : "-"}${formatNumber(item.qty)} ${item.unit}</td>
                <td>${item.detail}</td>
                <td>${item.user}</td>
            </tr>
        `).join("")
        : `<tr><td colspan="6">No hay movimientos registrados.</td></tr>`;
}

// ==========================================
// CALIDAD Y SOBRANTES
// ==========================================

function renderQuality() {

    $("quality-table").innerHTML = issues.map(item => `
        <tr>
            <td>${item.material}</td>
            <td>${formatNumber(item.qty)} ${item.unit}</td>
            <td>
                <span class="badge defective">${item.status}</span>
            </td>
        </tr>
    `).join("");

    $("surplus-table").innerHTML = surpluses.map(item => `
        <tr>
            <td>${item.material}</td>
            <td>${formatNumber(item.qty)} ${item.unit}</td>
            <td>
                <span class="badge available">${item.status}</span>
            </td>
        </tr>
    `).join("");
}

// ==========================================
// REPORTES
// ==========================================

function renderReports() {

    $("report-materials").textContent = materials.length;

    $("report-movements").textContent = movements.length;

    $("report-issues").textContent = issues.length;

    const surplus = surpluses.reduce(
        (sum, item) => sum + item.qty, 0
    );

    $("report-surplus").textContent =
        formatNumber(surplus) + " kg";

    const categories = [
        "Materia prima",
        "Empaque",
        "Producto terminado"
    ];

    $("report-summary").innerHTML = categories.map(category => {

        const count = materials.filter(
            item => item.category === category
        ).length;

        const percentage = materials.length
            ? (count / materials.length) * 100
            : 0;

        return `
            <p><b>${category}</b> (${count} referencias)</p>
            <div style="height:9px;background:#eee;border-radius:10px;margin-bottom:18px">
                <div style="height:9px;width:${percentage}%;background:#f47721;border-radius:10px"></div>
            </div>
        `;
    }).join("");
}

// ==========================================
// ACTUALIZAR TODAS LAS SECCIONES
// ==========================================

function renderAll() {

    renderDashboard();
    renderInventory();
    renderMovements();
    renderQuality();
    renderReports();
}

// ==========================================
// VENTANAS Y FORMULARIOS
// ==========================================

function field(label, name, type = "text", options = "", full = false) {

    let control;

    if (type === "select") {
        control = `
            <select name="${name}" required>
                ${options}
            </select>
        `;
    } else {
        control = `
            <input
                type="${type}"
                name="${name}"
                required
                ${type === "number" ? 'min="1"' : ""}
                ${type === "text" ? 'placeholder="Escribe aquí..."' : ""}
            >
        `;
    }

    return `
        <div class="field ${full ? "full" : ""}">
            <label>${label}</label>
            ${control}
        </div>
    `;
}

function materialOptions() {

    return materials.map(material => `
        <option value="${material.id}">
            ${material.name} (${material.id})
        </option>
    `).join("");
}

function openModal(type) {

    currentForm = type;

    let fields = "";
    let title = "";

    if (type === "entry" || type === "exit") {

        title = type === "entry"
            ? "Registrar entrada de material"
            : "Registrar salida de material";

        fields =
            field("Material", "material", "select", materialOptions()) +
            field("Cantidad", "qty", "number") +
            field(
                type === "entry" ? "Proveedor" : "Destino",
                "detail"
            ) +
            field("Fecha", "date", "date") +
            field("Responsable", "user");

    } else if (type === "new") {

        title = "Registrar nuevo material";

        fields =
            field("Nombre del material", "name") +
            field("Código", "id") +
            field(
                "Categoría",
                "category",
                "select",
                `
                    <option>Materia prima</option>
                    <option>Empaque</option>
                    <option>Producto terminado</option>
                `
            ) +
            field("Cantidad inicial", "qty", "number") +
            field(
                "Unidad",
                "unit",
                "select",
                `
                    <option>kg</option>
                    <option>und</option>
                    <option>rollos</option>
                `
            ) +
            field("Ubicación", "location");

    } else if (type === "quality") {

        title = "Registrar novedad";

        fields =
            field(
                "Tipo de registro",
                "kind",
                "select",
                `
                    <option value="issue">Material defectuoso</option>
                    <option value="surplus">Sobrante reutilizable</option>
                `
            ) +
            field("Material", "material", "select", materialOptions()) +
            field("Cantidad", "qty", "number") +
            field(
                "Estado",
                "status",
                "select",
                `
                    <option>Defectuoso</option>
                    <option>Pendiente de revisión</option>
                    <option>Reutilizable</option>
                `
            );
    }

    $("modal-title").textContent = title;

    $("form-fields").innerHTML = fields;

    $("modal").classList.add("show");

    const dateInput = document.querySelector('[name="date"]');

    if (dateInput) {
        dateInput.value = new Date().toISOString().split("T")[0];
    }
}

function closeModal() {
    $("modal").classList.remove("show");
    $("main-form").reset();
}

// ==========================================
// GUARDAR INFORMACIÓN
// ==========================================

$("main-form").addEventListener("submit", function(event) {

    event.preventDefault();

    const data = Object.fromEntries(
        new FormData(event.target).entries()
    );

    if (currentForm === "entry" || currentForm === "exit") {

        const material = materials.find(
            item => item.id === data.material
        );

        const quantity = Number(data.qty);

        if (!material || quantity <= 0) {
            showToast("Verifica la cantidad y el material.");
            return;
        }

        if (currentForm === "exit" && quantity > material.qty) {
            showToast("No hay suficiente inventario disponible.");
            return;
        }

        if (currentForm === "entry") {
            material.qty += quantity;
        } else {
            material.qty -= quantity;
        }

        const type = currentForm === "entry" ? "Entrada" : "Salida";

        movements.unshift({
            date: data.date.split("-").reverse().join("/"),
            type: type,
            material: material.name,
            qty: quantity,
            unit: material.unit,
            detail: data.detail,
            user: data.user
        });

        activity.unshift([
            type + " registrada",
            material.name + " · " + formatNumber(quantity) + " " + material.unit,
            "Ahora"
        ]);

    } else if (currentForm === "new") {

        const exists = materials.some(
            item => item.id.toLowerCase() === data.id.toLowerCase()
        );

        if (exists) {
            showToast("Ese código de material ya existe.");
            return;
        }

        materials.push({
            id: data.id,
            name: data.name,
            category: data.category,
            qty: Number(data.qty),
            unit: data.unit,
            location: data.location
        });

        activity.unshift([
            "Nuevo material registrado",
            data.name,
            "Ahora"
        ]);

    } else if (currentForm === "quality") {

        const material = materials.find(
            item => item.id === data.material
        );

        if (!material || Number(data.qty) <= 0) {
            showToast("Verifica los datos del registro.");
            return;
        }

        if (data.kind === "issue") {

            if (Number(data.qty) > material.qty) {
                showToast("La cantidad supera las existencias.");
                return;
            }

            issues.unshift({
                material: material.name,
                qty: Number(data.qty),
                unit: material.unit,
                status: data.status
            });

            activity.unshift([
                "Novedad de calidad",
                material.name + " · " + data.qty + " " + material.unit,
                "Ahora"
            ]);

        } else {

            if (Number(data.qty) > material.qty) {
                showToast("La cantidad supera las existencias.");
                return;
            }

            surpluses.unshift({
                material: material.name,
                qty: Number(data.qty),
                unit: material.unit,
                status: "Reutilizable"
            });

            activity.unshift([
                "Sobrante registrado",
                material.name + " · " + data.qty + " " + material.unit,
                "Ahora"
            ]);
        }
    }

    closeModal();
    renderAll();

    showToast("¡Registro guardado correctamente!");
});

// ==========================================
// MOVIMIENTO RÁPIDO
// ==========================================

function quickMovement(id) {

    openModal("entry");

    const select = document.querySelector('[name="material"]');

    if (select) {
        select.value = id;
    }
}

// ==========================================
// NOTIFICACIONES
// ==========================================

function showToast(message) {

    const toast = $("toast");

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

// ==========================================
// INICIO DE LA APLICACIÓN
// ==========================================

renderAll();
