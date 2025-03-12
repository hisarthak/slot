const fs = require("fs").promises;
const path = require("path");
const readline = require("readline");
const axios = require("axios");



// Function to prompt user for username and password
async function authenticateUser() {
    const chalk = await import("chalk"); 

    const configPath = path.join(process.cwd(), ".slot", "config.json");
     const repoPath = path.resolve(process.cwd(), ".slot");
       const oldSnapshotPath = path.join(repoPath, "oldsnapshot.json");
        try {
            await fs.access(oldSnapshotPath);
        } catch (error) {
            console.log(chalk.default.red("Error: Repository not initialized. Run 'slot init' first."));
            process.exit(1); // Exit the script
        }

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
        console.log(chalk.default.yellow("Authentication will be valid for 30 days."));
        
        
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
                       // Use old pushNumber if the username matches
                       const pushNumber = existingConfig.username === username 
                       ? existingConfig.pushNumber 
                       : 0;

                    // Save token to .slot/config.json
                    const token = res.data.token;
                    const userConfig = {
                        token: token,
                        username: username,
                        pushNumber: pushNumber
                    };

                    
                    
                                    

                    
                    // Save config file
                    const configDir = path.join(process.cwd(), ".slot");
                    const configPath = path.join(configDir, "config.json");

                    // Check if the directory exists, create it if not
                    try {
                        await fs.access(configDir);
                    } catch {
                        await fs.mkdir(configDir, { recursive: true });
                    }

                    // Write to the config file
                    await fs.writeFile(
                        configPath,
                        JSON.stringify(userConfig, null, 2)
                    );

                    console.log("Authentication successful!");
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

module.exports = {
    authenticateUser,
};
