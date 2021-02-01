const {
    contextBridge,
    ipcRenderer,
} = require("electron");



contextBridge.exposeInMainWorld(
    "app",
    {
        onlineStatusChanged: (status) => {
            ipcRenderer.send('online-status-changed', status ? 'online' : 'offline')
        },
        ipcLoadBuckets: ipcRenderer.invoke('load-buckets'),
        ipcLoadObjects: (args) => ipcRenderer.invoke('load-objects', args)
    },

);

