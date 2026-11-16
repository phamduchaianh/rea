// ==========================================
// 1. DATA & STORAGE LAYER
// ==========================================

// web storage key before postgresql
const STORAGE_KEY = 'rea_v01_data';

const defaultData = {
    network: {
        ssid: 'Home Wi-Fi',
        status: 'connected',
        gateway: '192.168.1.1',
        dns: '1.1.1.1',
        publicIp: '198.51.100.42',
        latency: '14ms'
    },
    devices: [
        {
            id: 'dev-1',
            name: 'Lenovo Yoga',
            type: 'laptop',
            os: 'NixOS 26.05',
            status: 'online',
            ip: '192.168.1.10',
            lastSeen: 'Just now',
            cpu: 24,
            ram: 62,
            battery: 88
        },
        {
            id: 'dev-2',
            name: 'Oppo Pad 3 Pro',
            type: 'tablet',
            os: 'Android 15',
            status: 'offline',
            ip: '192.168.1.15',
            lastSeen: '2h ago',
            cpu: 5,
            ram: 28,
            battery: 45
        },
        {
            id: 'dev-3',
            name: 'iPhone 15 Pro',
            type: 'smartphone',
            os: 'iOS 18.2',
            status: 'online',
            ip: '192.168.1.12',
            lastSeen: '1m ago',
            cpu: 14,
            ram: 46,
            battery: 76
        }
    ],
    services: [
        {
            id: 'srv-1',
            name: 'OpenSSH',
            deviceId: 'dev-1',
            port: 22,
            protocol: 'TCP',
            uptime: '14d 6h',
            status: 'running',
            description: 'Remote shell access'
        },
        {
            id: 'srv-2',
            name: 'Syncthing',
            deviceId: 'dev-1',
            port: 8384,
            protocol: 'HTTP',
            uptime: '6d 18h',
            status: 'running',
            description: 'P2P file synchronization'
        }
    ],
    activities: [
        { id: 'act-1', text: 'Lenovo Yoga joined Home Wi-Fi', timestamp: 'Just now', type: 'device' },
        { id: 'act-2', text: 'Oppo Pad 3 Pro went offline', timestamp: '2h ago', type: 'device' }
    ]
};

//================= STORAGE MANAGEMENT ==================
// in ver 0.2, PostgreSQL, Spring Boot may be used so easier to modify the state
function saveState(state){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function getState(){
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved){
        saveState(defaultData);
        return defaultData;
    }
    return JSON.parse(saved);
}

//================= VIEW SWITCHES LOGIC ================
function switchTab(viewName){
    // loop check navi buttons name then toggle active state
    document.querySelectorAll('.tab-btn').forEach(btn => {
        const isMatch = btn.dataset.view === viewName;
        btn.classList.toggle('active', isMatch);
    });

    // loop check views then toggle active state
    document.querySelectorAll('.view-panel').forEach(panel => {
        const isMatch = panel.dataset.panel === viewName;
        panel.classList.toggle('active', isMatch);
    });
};
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () =>{
        const clickedView = btn.dataset.view;
        switchTab(clickedView);
    });
});
