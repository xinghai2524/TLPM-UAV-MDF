const { app, BrowserWindow, Tray } = require('electron')
const path = require('path')


const createWindow = () => {
  const win = new BrowserWindow({
    width: 1290,
    height: 720,
    frame:false,
    icon: path.join(__dirname, './images/logo.png'),
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs")
    }
  })
  win.loadFile(path.join(__dirname, '../dist/index.html'));
}

app.whenReady().then(() => {
  // api
  require('./utils/apiEl.cjs')
  createWindow()
})

