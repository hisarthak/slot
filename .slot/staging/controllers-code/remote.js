const fs = require('fs');
const path = require('path');


// Adjust path to .slot folder
const MYGIT_FOLDER = path.join(process.cwd(), '.slot'); // .slot folder is outside the current folder
const REMOTE_FILE = path.join(MYGIT_FOLDER, 'remote.json'); // JSON file inside .slot

// Ensure .slot folder exists
function ensureMyGitFolder() {
    if (!fs.existsSync(MYGIT_FOLDER)) {
        console.error("Error: Repository not initialized. Run 'slot init' first.");
        process.exit(1);
    }
}

// Helper function to check if remote.json file exists
function remoteExists() {
    ensureMyGitFolder();
    return fs.existsSync(REMOTE_FILE);
}

// Helper function to read the JSON file
function readRemoteFile() {
    if (!remoteExists()) return null;

    try {
        const data = fs.readFileSync(REMOTE_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error");
        process.exit(1);
    }
}

// Helper function to write to the JSON file
function writeRemoteFile(content) {
    ensureMyGitFolder();
    try {
        fs.writeFileSync(REMOTE_FILE, JSON.stringify(content, null, 2), 'utf8');
    } catch (error) {
        console.error("Error");
        process.exit(1);
    }
}


// Command to add a remote URL (overwrites if exists)
function addRemote(url) {
    
    url = url.trim();
    // Validate URL format
    const regex = /^https:\/\/codeslot\.in\/[a-zA-Z0-9_\-/]+$/;
    if (!regex.test(url)) {
        console.error(`Invalid URL`);
        process.exit(1);
    }

    const remoteData = { url, addedAt: new Date().toISOString() };
    writeRemoteFile(remoteData);
    console.log(`Remote added (or replaced): ${url}`);
}

// Command to remove the .remote.json file
function removeRemote() {
    if (!remoteExists()) {
        console.error("Error: No remote to remove.");
        process.exit(1);
    }
    fs.unlinkSync(REMOTE_FILE);
    console.log("Remote removed.");
}

// Command to list the current remote URL
function listRemote() {
    if (!remoteExists()) {
        console.log("No remote configured.");
        return;
    }
    const remoteData = readRemoteFile();
    console.log(`remote: ${remoteData.url}`);
}

module.exports = {
    addRemote,
    removeRemote,
    listRemote,
};
