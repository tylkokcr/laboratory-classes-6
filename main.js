const { app, BrowserWindow } = require('electron');
const { exec } = require('child_process');
const http = require('http');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: true,
        webPreferences: {
            nodeIntegration: false
        }
    });

    const checkServer = () => {
        console.log('Checking if server is up...');
        http.get('http://localhost:3000', (res) => {
            console.log('Server is up, loading the app...');
            mainWindow.loadURL('http://localhost:3000');
        }).on('error', (err) => {
            console.log('Server not up yet, retrying in 1s...');
            setTimeout(checkServer, 1000);
        });
    };

    checkServer();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    console.log('Starting Express backend with npm start...');
    const serverProcess = exec('npm start', (err, stdout, stderr) => {
        if (err) {
            console.error(`Error starting server: ${err}`);
            return;
        }
        console.log(`Server stdout: ${stdout}`);
        console.error(`Server stderr: ${stderr}`);
    });

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

    serverProcess.on('exit', (code) => {
        console.log(`Express server exited with code ${code}`);
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
