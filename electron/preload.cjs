const { contextBridge, ipcRenderer, ipcMain } = require("electron")

// 一定要有这个versions，前端就通过这个判断是否在electron环境中
contextBridge.exposeInMainWorld("versions", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRenderer.invoke('ping')
})

contextBridge.exposeInMainWorld("ApiEl", {
  detel: (...args) =>  ipcRenderer.invoke("detel", ...args),
})

contextBridge.exposeInMainWorld("System", {
  windowsClose: () => { ipcRenderer.send("window-close") }
})

ipcRenderer.on("message", (_event, value) => { console.log(value) })
