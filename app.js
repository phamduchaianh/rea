// ===========================================================
// 1. DATA & STORAGE LAYER
// ===========================================================

// web storage key before postgresql
const STORAGE_KEY = "rea_v01_data";

const defaultData = {
  network: {
    ssid: "Home Wi-Fi",
    status: "connected",
    gateway: "192.168.1.1",
    dns: "1.1.1.1",
    publicIp: "198.51.100.42",
    latency: "14ms",
  },
  devices: [
    {
      id: "dev-1",
      name: "Lenovo Yoga Pro 14s",
      type: "laptop",
      os: "NixOS 26.05",
      status: "online",
      ip: "192.168.1.10",
      lastSeen: "Just now",
      cpu: 24,
      ram: 62,
      battery: 88,
    },
    {
      id: "dev-2",
      name: "Oppo Pad 3 Pro",
      type: "tablet",
      os: "Android 16",
      status: "offline",
      ip: "192.168.1.15",
      lastSeen: "2h ago",
      cpu: 5,
      ram: 28,
      battery: 45,
    },
    {
      id: "dev-3",
      name: "iPhone 15 Pro",
      type: "smartphone",
      os: "iOS 27.2",
      status: "online",
      ip: "192.168.1.12",
      lastSeen: "1m ago",
      cpu: 14,
      ram: 46,
      battery: 76,
    },
    {
      id: "dev-4",
      name: "Xiaomi Mi 15 Ultra",
      type: "smartphone",
      os: "Android 17",
      status: "online",
      ip: "192.168.1.14",
      lastSeen: "7m ago",
      cpu: 23,
      ram: 20,
      battery: 100,
    },
  ],
  services: [
    {
      id: "srv-1",
      name: "OpenSSH",
      deviceId: "dev-1",
      port: 22,
      protocol: "TCP",
      uptime: "14d 6h",
      status: "running",
      description: "Remote shell access",
    },
    {
      id: "srv-2",
      name: "Syncthing",
      deviceId: "dev-1",
      port: 8384,
      protocol: "HTTP",
      uptime: "6d 18h",
      status: "running",
      description: "P2P file synchronization",
    },
  ],
  activities: [
    {
      id: "act-1",
      text: "Lenovo Yoga joined Home Wi-Fi",
      timestamp: "Just now",
      type: "device",
    },
    {
      id: "act-2",
      text: "Oppo Pad 3 Pro went offline",
      timestamp: "2h ago",
      type: "device",
    },
  ],
};

//------------------ STORAGE MANAGEMENT --------------------
// in ver 0.2, PostgreSQL, Spring Boot may be used so easier to modify the state
function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function getState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    saveState(defaultData);
    return defaultData;
  }
  return JSON.parse(saved);
}
function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  const freshData = getState();
  renderAll();
  console.log("[REA] State reset to default!");
  return freshData;
}

//================= NAVIGATION BAR ================
function switchTab(viewName) {
  // loop check navi buttons name then toggle active state
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    const isMatch = btn.dataset.view === viewName;
    btn.classList.toggle("active", isMatch);
  });

  // loop check views then toggle active state
  document.querySelectorAll(".view-panel").forEach((panel) => {
    const isMatch = panel.dataset.panel === viewName;
    panel.classList.toggle("active", isMatch);
  });
}
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const clickedView = btn.dataset.view;
    switchTab(clickedView);
  });
});
// RESET DEMO button
document.getElementById("reset-demo-btn").addEventListener("click", () => {
  resetState();
});
//view all on dashboard
document.querySelectorAll(".nav-jump-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    switchTab(btn.dataset.jump);
  });
});
// ======================================================
// 2. UI RENDER
// ======================================================
let currentDeviceFilter = "all";
let currentSearchQuery = "";

//------------------- SHARED HELPERS --------------------
function renderSegments(percent) {
  const filled = Math.round(percent / 10);
  let html = "";
  for (let i = 0; i < 10; i++) {
    html += `<span class="segment ${i < filled ? "filled" : ""}"></span>`;
  }
  return html;
}
function getDeviceIcon(type) {
  const icons = {
    laptop: '<iconify-icon icon="pixelarticons:laptop"></iconify-icon>',
    tablet: '<iconify-icon icon="pixelarticons:device-tablet"></iconify-icon>',
    smartphone:
      '<iconify-icon icon="pixelarticons:device-phone"></iconify-icon>',
    server: '<iconify-icon icon="pixelarticons:server"></iconify-icon>',
    desktop: '<iconify-icon icon="pixelarticons:monitor"></iconify-icon>',
  };
  return (
    icons[type] || '<iconify-icon icon="pixelarticons:archive"></iconify-icon>'
  );
}
//---------------------- DASHBOARD ----------------------
function renderDashboard() {
  // get length
  const state = getState();
  const onlineDevices = state.devices.filter(
    (device) => device.status === "online",
  ).length;
  const runningService = state.services.filter(
    (service) => service.status === "running",
  ).length;

  // display kpi by textContent
  // header
  document.getElementById("nav-device-count").textContent =
    `${onlineDevices}/${state.devices.length}`;
  document.getElementById("nav-service-count").textContent =
    `${runningService}/${state.services.length}`;
  // kpi
  document.getElementById("kpi-online-count").textContent = onlineDevices;
  document.getElementById("kpi-total-devices").textContent =
    `/ ${state.devices.length} TOTAL`;
  document.getElementById("kpi-net-status").textContent =
    `${state.network.status.toUpperCase()}`;
  document.getElementById("kpi-net-latency").textContent =
    `${state.network.latency} ping`;
  document.getElementById("kpi-service-count").textContent = runningService;
  document.getElementById("kpi-total-services").textContent =
    `/ ${state.services.length} RUNNING`;
  //render segments
  const devicePercent =
    state.devices.length > 0 ? (onlineDevices / state.devices.length) * 100 : 0;
  const servicePercent =
    state.services.length > 0
      ? (runningService / state.services.length) * 100
      : 0;

  document.getElementById("kpi-device-meter").innerHTML =
    renderSegments(devicePercent);
  document.getElementById("kpi-service-meter").innerHTML =
    renderSegments(servicePercent);
  // device overview
  document.getElementById("quick-devices-list").innerHTML = state.devices
    .map(
      (dev) => `
    <div class="quick-device-item">
      <div class="qd-left">
        <span class="qd-icon">${getDeviceIcon(dev.type)}</span>
        <div>
          <div class="qd-name">${dev.name}</div>
          <div class="qd-os">${dev.os}</div>
        </div>
      </div>
      <div class="qd-right">
        <span class="qd-ip">${dev.ip}</span>
        <span class="status-badge ${dev.status}">
          <span class="status-pip ${dev.status}"></span>
          ${dev.status.toUpperCase()}
        </span>
      </div>
    </div>
  `,
    )
    .join("");

  // recent activity
  document.getElementById("activity-count-badge").textContent =
    `${state.activities.length} EVENTS`;
  document.getElementById("activity-feed-list").innerHTML = state.activities
    .map(
      (act) => `
    <div class="activity-item type-${act.type}">
      <span class="activity-icon"><iconify-icon icon="pixelarticons:script"></iconify-icon></span>
      <div class="activity-content">
        <div class="activity-text">${act.text}</div>
        <div class="activity-time">${act.timestamp}</div>
      </div>
    </div>
  `,
    )
    .join("");

  document.getElementById("global-ping-text").textContent =
    `LAN: ${state.network.latency}`;
  document.getElementById("kpi-net-ssid").textContent = state.network.ssid;
  document.getElementById("kpi-net-ip").textContent = state.network.gateway;
}
//---------------------- DEVICES ------------------------
function renderDevices() {
  const state = getState();
  const q = currentSearchQuery.toLowerCase();

  const selectedDevices = state.devices.filter((dev) => {
    const matchesStatus =
      currentDeviceFilter === "all" || dev.status === currentDeviceFilter;
    const matchesSearch =
      dev.name.toLowerCase().includes(q) ||
      dev.os.toLowerCase().includes(q) ||
      dev.ip.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });
  document
    .getElementById("devices-empty-state")
    .classList.toggle("hidden", selectedDevices.length > 0);
  // ui
  document.getElementById("devices-grid").innerHTML = selectedDevices
    .map(
      (dev) => `
      <div class="device-card">
        <div class="device-card-header">
          <div class="device-title-row">
            <span class="device-glyph">${getDeviceIcon(dev.type)}</span>
            <div class="device-name-wrap">
              <h3 class="device-name">${dev.name}</h3>
              <span class="device-type-badge">${dev.type.toUpperCase()}</span>
            </div>
          </div>
          <span class="status-badge ${dev.status}">
            <span class="status-pip ${dev.status}"></span>
            ${dev.status.toUpperCase()}
          </span>
        </div>

        <div class="device-card-body">
          <div class="device-meta-table">
            <div class="meta-field">
              <span class="meta-label">OS</span>
              <span class="meta-value">${dev.os}</span>
            </div>
            <div class="meta-field">
              <span class="meta-label">IP ADDRESS</span>
              <span class="meta-value">${dev.ip}</span>
            </div>
          </div>

          <div class="telemetry-group">
            <div class="telemetry-item">
              <div class="telemetry-label-row">
                <span class="telemetry-name">CPU</span>
                <span class="telemetry-val">${dev.cpu}%</span>
              </div>
              <div class="segment-bar">${renderSegments(dev.cpu)}</div>
            </div>
            <div class="telemetry-item">
              <div class="telemetry-label-row">
                <span class="telemetry-name">RAM</span>
                <span class="telemetry-val">${dev.ram}%</span>
              </div>
              <div class="segment-bar">${renderSegments(dev.ram)}</div>
            </div>
            <div class="telemetry-item">
              <div class="telemetry-label-row">
                <span class="telemetry-name">BATTERY</span>
                <span class="telemetry-val">${dev.battery}%</span>
              </div>
              <div class="segment-bar">${renderSegments(dev.battery)}</div>
            </div>
          </div>
        </div>

        <div class="device-card-footer">
          <span class="last-seen-text">Seen: ${dev.lastSeen}</span>
          <button
            type="button"
            class="btn btn-sm btn-secondary"
            data-action="toggle-status"
            data-id="${dev.id}"
          >
            ${dev.status === "online" ? "SET OFFLINE" : "SET ONLINE"}
          </button>
        </div>
      </div>`,
    )
    .join("");
}
// input search
document
  .getElementById("device-search-input")
  .addEventListener("input", (e) => {
    currentSearchQuery = e.target.value.trim();
    renderDevices();
  });
// filter button
function switchFilter(filterButton) {
  //check name then toggle
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    const isMatch = btn.dataset.filter === filterButton;
    btn.classList.toggle("active", isMatch);
  });
}
// filter: click event
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const clickedFilter = btn.dataset.filter;
    switchFilter(clickedFilter);
    currentDeviceFilter = clickedFilter;
    renderDevices();
  });
});
// toggle online, use for devcies-grid instead specific card
document.getElementById("devices-grid").addEventListener("click", (e) => {
  // click area detect
  const toggleBtn = e.target.closest('[data-action="toggle-status"]');
  if (!toggleBtn) return; // pass if other area
  const deviceId = toggleBtn.dataset.id;
  const state = getState();
  const targetDevice = state.devices.find((dev) => dev.id === deviceId);

  if (!targetDevice) return;
  targetDevice.status = targetDevice.status === "online" ? "offline" : "online";
  targetDevice.lastSeen = "Just now";

  state.activities.unshift({
    id: `act-${Date.now()}`,
    text: `${targetDevice.name} went ${targetDevice.status}`,
    timestamp: "Just now",
    type: "device",
  });

  saveState(state);
  renderAll();
});

// FOR TESTING PURPOSE BEFORE IT HAS REAL BACKEND
// open add device form
document
  .getElementById("open-add-device-modal")
  .addEventListener("click", (e) => {
    document.getElementById("add-device-modal").classList.remove("hidden");
  });
//close add device form
function closeAddModal() {
  document.getElementById("add-device-modal").classList.add("hidden");
  document.getElementById("add-device-form").reset();
  document.getElementById("val-cpu").textContent = "20%";
  document.getElementById("val-ram").textContent = "45%";
  document.getElementById("val-battery").textContent = "100%";
}
//slider
document.getElementById("add-device-modal").addEventListener("input", (e) => {
  if (e.target.type !== "range") {
    return;
  }
  document.getElementById(e.target.id.replace("dev-", "val-")).textContent =
    e.target.value + "%";
});
//close form cases
document.getElementById("close-modal-btn").addEventListener("click", () => {
  closeAddModal();
});
document.getElementById("cancel-modal-btn").addEventListener("click", () => {
  closeAddModal();
});
document.getElementById("add-device-modal").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) {
    closeAddModal();
  }
});
//submit form
document.getElementById("add-device-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const state = getState();
  const devName = document.getElementById("dev-name").value.trim();
  const devOs = document.getElementById("dev-os").value.trim();
  const devIp = document.getElementById("dev-ip").value.trim();
  const devType = document.getElementById("dev-type").value;
  const devCpu = Number(document.getElementById("dev-cpu").value);
  const devRam = Number(document.getElementById("dev-ram").value);
  const devBattery = Number(document.getElementById("dev-battery").value);

  const newDev = {
    id: `dev-${Date.now()}`,
    name: devName,
    type: devType,
    os: devOs,
    status: "online",
    ip: devIp,
    lastSeen: "Just now",
    cpu: devCpu,
    ram: devRam,
    battery: devBattery,
  };

  state.devices.push(newDev);
  state.activities.unshift({
    id: `act-${Date.now()}`,
    text: `${devName} (${devIp}) registered to network`,
    timestamp: "Just now",
    type: "device",
  });

  saveState(state);
  renderAll();
  closeAddModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeAddModal();
  }
});
//---------------------- NETWORKS -----------------------
function renderNetworks() {
  const state = getState();
  const onlineCount = state.devices.filter(
    (dev) => dev.status === "online",
  ).length;

  //update primary network interface
  const networkSpecs = [
    { label: "SSID", value: state.network.ssid, sub: "802.11ax · 5GHz" },
    { label: "GATEWAY IP", value: state.network.gateway, sub: "Local Router" },
    {
      label: "DNS SERVER",
      value: state.network.dns,
      sub: "Cloudflare Primary",
    },
    {
      label: "PUBLIC IP",
      value: state.network.publicIp,
      sub: "ISP WAN Address",
    },
    { label: "LATENCY", value: state.network.latency, sub: "Gateway RTT" },
  ];
  document.getElementById("network-specs-container").innerHTML = networkSpecs
    .map(
      (item) =>
        `<div class="net-spec-block">
      <span class="net-spec-label">${item.label}</span>
      <span class="net-spec-value">${item.value}</span>
      <span class="net-spec-sub">${item.sub}</span>
    </div>`,
    )
    .join("");

  // update network topology tree
  document.getElementById("topo-gateway-ssid").textContent = state.network.ssid;
  document.getElementById("topo-gateway-ip").textContent =
    state.network.gateway;
  document.getElementById("topology-device-badge").innerHTML =
    `${onlineCount} ONLINE / ${state.devices.length} NODES`;

  //update leaves
  document.getElementById("topology-leaves").innerHTML = state.devices
    .map(
      (dev) => `<div class="topology-leaf-item">
      <div class="leaf-drop-line"></div>
      <div class="leaf-node">
        <div class="leaf-node-top">
          <span class="leaf-name">${dev.name}</span>
          <span class="status-pip ${dev.status}"></span>
        </div>
        <div class="leaf-node-sub">
          <span>${dev.ip}</span>
          <span>${dev.status.toUpperCase()}</span>
        </div>
      </div>
    </div>`,
    )
    .join("");
}
// re-test latency
document.getElementById("ping-test-btn").addEventListener("click", () => {
  const state = getState();
  //random, add login backend in v0.2
  const randomMs = Math.floor(Math.random() * 15) + 8;
  const newLatency = `${randomMs}ms`;

  state.network.latency = newLatency;
  //log activity
  state.activities.unshift({
    id: `act-${Date.now()}`,
    text: `Network latency tested: ${newLatency}`,
    timestamp: "Just now",
    type: "network",
  });
  saveState(state);
  renderAll();
});

//---------------------- SERVICES -----------------------
function renderServices() {
  const state = getState();
  const runningCount = state.services.filter(
    (srv) => srv.status === "running",
  ).length;

  document.getElementById("services-badge-counter").textContent =
    `${runningCount} ACTIVE`;

  document.getElementById("services-table-body").innerHTML = state.services
    .map((srv) => {
      const hostDevice = state.devices.find((d) => d.id === srv.deviceId);
      //if hostdevice exist then bind icon+name, else unknown
      const hostLabel = hostDevice
        ? `${getDeviceIcon(hostDevice.type)} ${hostDevice.name}`
        : "Unknown Host";

      const statusClass = srv.status === "running" ? "online" : "offline";

      return `
        <tr>
          <td>
            <div class="service-name-cell">
              <span class="service-title">${srv.name}</span>
              <span class="service-desc">${srv.description}</span>
            </div>
          </td>
          <td>
            <span class="host-badge">${hostLabel}</span>
          </td>
          <td>
            <span class="port-badge">${srv.port}</span>
          </td>
          <td>${srv.protocol}</td>
          <td>${srv.uptime}</td>
          <td>
            <span class="status-badge ${statusClass}">
              <span class="status-pip ${statusClass}"></span>
              ${srv.status.toUpperCase()}
            </span>
          </td>
          <td class="text-right">
            <button
              type="button"
              class="btn btn-sm btn-secondary"
              data-action="toggle-service"
              data-id="${srv.id}"
            >
              ${srv.status === "running" ? "STOP" : "START"}
            </button>
          </td>
        </tr>`;
    })
    .join("");
}
//service status toggle
document
  .getElementById("services-table-body")
  .addEventListener("click", (e) => {
    const toggleBtn = e.target.closest('[data-action="toggle-service"]');
    if (!toggleBtn) return;

    const serviceId = toggleBtn.dataset.id;
    const state = getState();
    const targetService = state.services.find((srv) => srv.id === serviceId);
    if (!targetService) return;

    // toggle state
    const isRunning = targetService.status === "running";
    targetService.status = isRunning ? "stopped" : "running";
    targetService.uptime = isRunning ? "0m" : "Just started";

    //activities log
    state.activities.unshift({
      id: `act-${Date.now()}`,
      text: `${targetService.name} service ${targetService.status}`,
      timestamp: "Just now",
      type: "service",
    });
    saveState(state);
    renderAll();
  });
// ======================================================
// 3. MAIN
// ======================================================
function renderAll() {
  renderDashboard();
  renderDevices();
  renderNetworks();
  renderServices();
}

renderAll();
