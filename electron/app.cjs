const { app, BrowserWindow, Tray } = require('electron')
const path = require('path')


const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    icon: path.join(__dirname, './images/logo.png'),
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs")
    }
  })
  win.loadFile(path.join(__dirname, '../dist/index.html'));
}

app.whenReady().then(() => {
  createWindow()
})
