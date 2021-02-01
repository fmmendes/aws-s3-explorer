const {
  app,
  BrowserWindow,
  Notification,
  ipcMain
} = require('electron');

const path = require('path');
const fs = require('fs')
var _ = require('lodash');

const root = fs.readdirSync('/');
var AWS = require("aws-sdk");
const S3 = require('aws-sdk/clients/s3')

try {
  require('electron-reloader')(module);
} catch { }

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

async function createWindow() {
  const { session } = require('electron')

  // session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  //   callback({
  //     responseHeaders: {
  //       ...details.responseHeaders,
  //       'Content-Security-Policy': ['default-src \'self\'']
  //     }
  //   })
  // })

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1080,
    minWidth: 680,
    height: 840,
    title: app.getName(),
    webPreferences: {
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, "preload.js"),
      disableBlinkFeatures: "Auxclick",
      sandbox: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.webContents.openDevTools();
};

function showNotification(title, body) {
  const notification = {
    title: title,
    body: body
  }
  new Notification(notification).show()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.on('online-status-changed', (event, status) => { showNotification('Status Alert', 'You are ' + status) })

AWS.config.getCredentials(function (err) {
  if (err) console.log(err.stack);
  // credentials not loaded
  else {
    console.log("Access key:", AWS.config.credentials.accessKeyId);
  }
});

console.log("Region: ", AWS.config.region);

var s3 = new AWS.S3();

// s3.listBuckets(s3params, function(err, data) {
//   if (err) console.log(err, err.stack); // an error occurred
//   else     console.log(data);           // successful response
// });

let bucketsList = new Array();

ipcMain.handle('load-buckets', async (event, args) => {
  var data = await s3.listBuckets({}).promise();

  let buckets = data.Buckets
  buckets.forEach(bucket => {
    bucketsList.indexOf(bucket.Name) === -1 ? bucketsList.push(bucket.Name) : null;
  });

  return bucketsList
})

ipcMain.handle('load-objects', async (event, args) => {
  var data = await s3.listObjectsV2(args).promise();

  return data
})
