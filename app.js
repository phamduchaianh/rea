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
      os: "Android 15",
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
      os: "iOS 18.2",
      status: "online",
      ip: "192.168.1.12",
      lastSeen: "1m ago",
      cpu: 14,
      ram: 46,
      battery: 76,
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
  renderDashboard();
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

// ======================================================
// 2. UI RENDER
// ======================================================

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
    `/ ${state.network.latency} ping`;
  document.getElementById("kpi-service-count").textContent = runningService;
  document.getElementById("kpi-total-services").textContent =
    `${state.services.length} RUNNING`;

  // device overview
  document.getElementById("quick-devices-list").innerHTML = state.devices
    .map(
      (dev) => `
    <div class="quick-device-item">
      <div class="qd-left">
        <span class="qd-icon">💻</span>
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
      <span class="activity-icon">📜</span>
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

//debug log

console.log(getState());
renderDashboard();
