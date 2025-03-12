const fs = require("fs").promises;
const path = require("path");
const axios = require("axios");
const cliProgress = require("cli-progress"); // Import CLI progress bar
const readline = require("readline");

let theToken;
let theUsername;
let thePushNumber;
let ourRepoName;
// Helper function to check if the user is logged in (checks the .slot/config.json)
async function isLoggedIn() {
    try {
        const configPath = path.join(process.cwd(),".slot", "config.json");
        const config = await fs.readFile(configPath, "utf8");
        const userConfig = JSON.parse(config);

        // Check if token is present
        if (userConfig.token) {
            try {
                           // Verify the JWT token (this will automatically check for expiration)
                           const response = await axios.post("https://gitspace.duckdns.org:3002/verifyToken", {
                               token: userConfig.token,

                           });
                         
               if (response.data.valid) {
                   theToken = userConfig.token;
                   thePull = userConfig.push;
                   thePushNumber = userConfig.pushNumber;
                   theLocalRepoId = userConfig.localRepoId;
           
                   return true; // Token is valid
               } else {
                   console.error("Invalid token.");
                   return false; // Token is invalid
               }
           
           
                          
                       }  catch (err) {
                console.log("Error");
                return false; // Invalid token or token is expired
            }
        } else {
            return false; // No token found
        }
    } catch (err) {
        return false; // No config file found or error reading the file
    }
}

// Helper function to validate if the username matches the remote URL
async function validateRepositoryAccess() {
    try {
        // Adjust path to .slot folder
        const configPath = path.join(process.cwd(),".slot", "config.json");
        const remotePath = path.join(process.cwd(),".slot", "remote.json");
     

        // Read the config file (which contains the username)
        const configData = await fs.readFile(configPath, "utf8");
        const config = JSON.parse(configData);
        let { username } = config;

        theUsername = config.username;
        thePushNumber = config.pushNumber;

        // Read the remote file (which contains the URL)
        const remoteData = await fs.readFile(remotePath, "utf8");
        const remote = JSON.parse(remoteData);
        const remoteUrl = remote.url;

        // Validate the URL format
        const match = remoteUrl.match(/^https:\/\/codeslot\.in\/([a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)$/);
        if (!match) {
            throw new Error("Invalid remote URL format.");
        }
          ourRepoName = match[1];
        const remoteUsername = match[1].split("/")[0]; // Extract username from "username/repositoryName"
        const remoteRepo = match[1].split("/")[1]; // Extract repository name from "username/repositoryName"

        // Compare usernames
        if (username !== remoteUsername) {
            throw new Error(
                `Access denied. You do not have permission to access this repository. 
Repository: ${remoteRepo},
Username: ${username} `
            );
        }
    } catch (err) {
        console.error("Error");
        process.exit(1); // Exit with error
    }
}


// Function to prompt user for username and password
async function promptLogin() {
    const configPath = path.join(process.cwd(), ".slot", "config.json");

    // Load existing config if it exists
    let existingConfig = {};
    try {
        const data = await fs.readFile(configPath, "utf8");
        existingConfig = JSON.parse(data);
    } catch (err) {
        if (err.code !== "ENOENT") {
            console.error("Error");
        }
    }
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve, reject) => {
        rl.question("Enter your Codeslot.in username: ", (username) => {
            rl.question("Enter your password: ", async (password) => {
                try {
                    // Send login request to your backend
                    const res = await axios.post(
                        `https://gitspace.duckdns.org:3002/login`,
                        {
                            username: username,
                            password: password,
                        },
                        {
                            headers: { "x-request-source": "cli" }, // Custom header to indicate CLI
                        }
                    );
                    const token = res.data.token;
                    // Use old pushNumber if the username matches
                    const pushNumber = existingConfig.username === username 
                        ? existingConfig.pushNumber 
                        : 0;

                    const userConfig = {
                        token,
                        username,
                        pushNumber,
                    };


                    // Save config file
                    await fs.writeFile(
                        path.join(process.cwd(), ".slot", "config.json"),
                        JSON.stringify(userConfig, null, 2)
                    );
                    thePushNumber = userConfig.pushNumber;
                    resolve(token); // Return token after successful login
                } catch (err) {
                    console.error(
                        "Error during authentication: ",
                        err.response?.data?.message || err.message
                    );
                    reject(err);
                } finally {
                    rl.close();
                }
            });
        });
    });
}

async function deleteFolderContents(folderPath) {
    try {
        await fs.access(folderPath); // Check if folder exists
        const files = await fs.readdir(folderPath);
        
        for (const file of files) {
            const filePath = path.join(folderPath, file);
            const stat = await fs.stat(filePath);

            if (stat.isDirectory()) {
                await deleteFolderContents(filePath);
                await fs.rmdir(filePath);
            } else {
                await fs.unlink(filePath);
            }
        }
    } catch (err) {
        if (err.code !== 'ENOENT') throw err; // Ignore folder not found errors
    }
}


async function pullRepo(clone) {
    const chalk = await import("chalk");
    const repoPath = path.resolve(process.cwd(), ".slot");
    const remoteFilePath = path.join(repoPath, "remote.json");
    let logsDataResponse;
    const stagingPath = path.join(repoPath, 'staging');
    const logsPath = path.join(repoPath, "logs.json");
    const commitsPath = path.join(repoPath, "commits");
    const oldSnapshotPath = path.join(repoPath, "oldsnapshot.json");
    try {
        await fs.access(oldSnapshotPath);
    } catch (error) {
        console.log(chalk.default.red("Error: Repository not initialized. Run 'slot init' first."));
        process.exit(1); // Exit the script
    }
    if(!clone){
        try {
            await fs.access(remoteFilePath);
        } catch (error) {
            console.error("Remote not set. Please set the remote repository using 'slot remote add <url>'.");
            process.exit(1); // Exit the script
        }}
    const configPath = path.join(repoPath, "config.json");

    const rootPath = process.cwd();

    try {
      
       const loggedIn = await isLoggedIn();
       
       if (!loggedIn) {
          
           console.log(chalk.default.yellow("Authentication required, valid for 30 days."));
           token = await promptLogin(); // Prompt for login if not logged in
        theToken = token;
           console.log("Authentication successful.");
       }
   let remoteFileContent;
   let remoteData;
     if(!clone){
     remoteFileContent = await fs.readFile(remoteFilePath, "utf8");
     remoteData = JSON.parse(remoteFileContent);
     }
       let repoIdentifier;
        if(!clone){
        // console.log("🔗 Extracting repository identifier...");
        const urlParts = remoteData.url.split("/");
        if (urlParts.length < 3) {
            throw new Error("Invalid URL format in remote.json");
        }
        repoIdentifier = `${urlParts[urlParts.length - 2]}/${urlParts[urlParts.length - 1]}`;
    }
   
       if(!clone){
       // Validate repository access
       await validateRepositoryAccess();
   
       }
       else{
       
        thePushNumber = 0;
        const urlParts = clone.split("/");
        if (urlParts.length < 3) {
            throw new Error("Invalid URL format in remote.json");
        }
         repoIdentifier = `${urlParts[urlParts.length - 2]}/${urlParts[urlParts.length - 1]}`;
         try {
            // Check repository access
            const response = await axios.post(
                "https://gitspace.duckdns.org:3002/repo/checkRepositoryAccess",
                { name: repoIdentifier, username: theUsername },
                { headers: { "Content-Type": "application/json" } }
            );
        
            // If response message is "Access", continue execution
            if (response.data.message === "Access") {
                // console.log("Repository access granted.");
            } else {
                console.error("Repository does not exist or access is denied.");
                process.exit(1); // Exit with error
            }
        } catch (error) {
            console.error("Repository does not exist or access is denied.");
            process.exit(1); // Exit with error
        }

    
       }
        // console.log("Reading config.json...");
        const configContent = await fs.readFile(configPath, "utf8");
        const configData = JSON.parse(configContent);
         theToken = configData.token;

    
        // console.log(`Repository Identifier: ${repoIdentifier}`);

        const s3LogsKey = `commits/${repoIdentifier}/logs.json`;

        // console.log("Fetching logs.json URL...");
        const response = await axios.post("https://gitspace.duckdns.org:3002/repo/user/download/get-url", 
            { keyNames: [s3LogsKey], theToken, thePushNumber, ourRepoName, clone }, 
            { headers: { "Content-Type": "application/json" } }
        );
        if (!clone && response.data?.message === "not required") {
            console.log("Already up to date");
          return;
        }
        if(!clone){
        console.log("Pulling");
        }else{
            console.log("Cloning repository")
        }
        const { uploadUrls } = response.data;
        if (!uploadUrls || uploadUrls.length === 0) {
            throw new Error("No upload URL received from server.");
        }
        // console.log("Logs.json URL received.");

        // console.log("Downloading logs.json...");
        try {
             logsDataResponse = await axios.get(uploadUrls[0], {
                headers: { "Content-Type": "application/octet-stream" },
                timeout: 30000,
            });
        
        
            await fs.writeFile(logsPath, JSON.stringify(logsDataResponse.data, null, 2), "utf-8");
        
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.error("No commits have been pushed to this repository yet");
                process.exit(1); // Exit with error code 1
            } else {
                console.error("Error");
                process.exit(1);
            }
        }
        const fileContent = JSON.stringify(logsDataResponse.data, null, 2);
        // console.log("Logs.json downloaded.");

        // console.log("Writing logs.json to local file...");
        await fs.writeFile(logsPath, fileContent, "utf-8");
        // console.log("logs.json saved!");

        // console.log("Parsing logs.json...");
        const logs = JSON.parse(fileContent);
        // console.log(" Parsed logs:", logs);

        if (!Array.isArray(logs)) {
            throw new Error("logs.json does not contain an array of commits.");
        }

        // console.log("Finding highest commit...");
        const highestCommit = logs.reduce((max, commit) => commit.count > max.count ? commit : max, logs[0]);
        const commitID = highestCommit.commitID;

        if (!commitID) {
            throw new Error("No commitID found in logs.json.");
        }

        // console.log(`Highest commit found: ${commitID}`);

        const commitDir = path.join(commitsPath, commitID);
        // console.log(`Creating directory: ${commitDir}`);
        await fs.mkdir(commitDir, { recursive: true });

        // console.log("Fetching commitData.json URL...");
        const commitDataKey = `commits/${repoIdentifier}/${commitID}/commitData.json`;
        const commitDataResponse = await axios.post("https://gitspace.duckdns.org:3002/repo/user/download/get-url", 
            { keyNames: [commitDataKey], theToken, thePushNumber, ourRepoName, clone }, 
            { headers: { "Content-Type": "application/json" } }
        );

        const { uploadUrls: commitDataUrls } = commitDataResponse.data;
        if (!commitDataUrls || commitDataUrls.length === 0) {
            throw new Error("No URL received for commitData.json.");
        }
        // console.log("commitData.json URL received.");

        // console.log(" Downloading commitData.json...");
        const commitDataFile = await axios.get(commitDataUrls[0], 
            { headers: { "Content-Type": "application/octet-stream" }, timeout: 30000 }
        );

        const commitDataPath = path.join(commitDir, "commitData.json");
        const commitDataFileContent = JSON.stringify(commitDataFile.data, null, 2);
        // console.log("commitData.json downloaded.");

        // console.log("Writing commitData.json to local file...");
        await fs.writeFile(commitDataPath, commitDataFileContent);
        // console.log("commitData.json saved!");

        // console.log("Parsing commitData.json...");
        const commitData = JSON.parse(commitDataFileContent);
        // console.log("Parsed commitData:", commitData);

        const fileKeys = [
            ...Object.values(commitData)
                .filter(file => file.droppable === false) // Only include files, not directories
                .map(file => `commits/${repoIdentifier}/${commitID}/${file.path.replace(/\\/g, "/")}`),
           `commits/${repoIdentifier}/${commitID}/commit.json`
        ];
        // console.log("File keys to download:", fileKeys);


        // console.log("🔗 Fetching URLs for commit files...");
        const urlResponse = await axios.post("https://gitspace.duckdns.org:3002/repo/user/download/get-url", 
            { keyNames: fileKeys, theToken, thePushNumber, ourRepoName, clone }, 
            { headers: { "Content-Type": "application/json" } }
        );

        const { uploadUrls: fileUrls, pushNumber } = urlResponse.data;
        let savedPushNumber = pushNumber; 
        // console.log("File URLs received:", fileUrls);

        if (!fileUrls || fileUrls.length === 0) {
            throw new Error("No URLs received for commit files.");
        }
 // Initialize progress bar
 const progressBar = new cliProgress.SingleBar(
    {
        format: " {bar} {percentage}% | {value}/{total} files",
    },
    cliProgress.Presets.shades_classic
);

// Start progress bar with total files - 1
progressBar.start(fileUrls.length - 1, 0);

        for (let i = 0; i < fileUrls.length; i++) {
            // console.log(`📥 Downloading file ${i + 1}/${fileUrls.length}...`);
            // console.log(fileUrls[i]);
            const fileData = await axios.get(fileUrls[i], 
                { headers: { "Content-Type": "application/octet-stream" }, timeout: 30000 }
            );
            const fallbackPath = `commit.json`;

            const commitFiles = Object.values(commitData).filter(file => file.droppable === false);
            
            if (commitFiles.length === 0) {
                console.error("Error");
                return;
            }
            
            const relativeFilePath = commitFiles[i]?.path || fallbackPath;

            // console.log(`💾 Saving file: ${relativeFilePath}`);

            const fileDataContent = fileData.data;
            // console.log(fileDataContent);
            const localFilePath = path.join(commitDir, relativeFilePath);
            
            let contentToWrite;

if (typeof fileDataContent === 'object' && !Buffer.isBuffer(fileDataContent)) {
    // Convert objects to a JSON string
    contentToWrite = JSON.stringify(fileDataContent, null, 2);
} else {
    // If it's already a valid format (string, Buffer, etc.), use it directly
    contentToWrite = fileDataContent;
}
 await fs.mkdir(path.dirname(localFilePath), { recursive: true });

await fs.writeFile(localFilePath, contentToWrite);
           

            const rootFilePath = path.join(rootPath, relativeFilePath);
      
            await fs.mkdir(path.dirname(rootFilePath), { recursive: true });
         

           if(relativeFilePath=="commit.json" || relativeFilePath=="commitData.json"){
            continue
           }else{
            await fs.writeFile(rootFilePath, contentToWrite);}
            
            // Update progress bar
            progressBar.update(i + 1);
            // console.log("4");
        }
        progressBar.stop();

        // console.log("All commit files downloaded and saved!");

        // console.log("Updating oldsnapshot.json...");
        const oldSnapshot = JSON.parse(commitDataFileContent);
        for (const key in oldSnapshot) {
            if (Object.prototype.hasOwnProperty.call(oldSnapshot, key)) {
                oldSnapshot[key].change = clone?true:false;
                oldSnapshot[key].new = false;
                oldSnapshot[key].pull = clone?false:true;
            }
        }
        await fs.writeFile(oldSnapshotPath, JSON.stringify(oldSnapshot, null, 2));
        // console.log("oldsnapshot.json updated!");
        if (clone) {
            deleteFolderContents(stagingPath);
        }
        if (clone && (await fs.stat(logsPath).catch(() => false))) {
            await fs.unlink(logsPath);
        }
    
       
           
            configData.pushNumber = savedPushNumber;
            await fs.writeFile(configPath, JSON.stringify(configData, null, 2));

    } catch (err) {
        console.error("Error");
    }
}

module.exports = { pullRepo };
