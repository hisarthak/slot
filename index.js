#!/usr/bin/env node

const yargs = require('yargs');
const { hideBin } = require("yargs/helpers");

const { initRepo } = require("./controllers-code/init.js");
const { addFileToRepo, addAllToRepo } = require("./controllers-code/addController");
const { commitRepo } = require("./controllers-code/commit.js");
const { commitLogs } = require("./controllers-code/commitLogs.js");
const { pushRepo } = require("./controllers-code/push");
const { pullRepo } = require("./controllers-code/pull");
const { revertRepo } = require("./controllers-code/revert");
const {addRemote, removeRemote, listRemote} = require("./controllers-code/remote.js");
const {authenticateUser} = require("./controllers-code/authenticate.js");

yargs(hideBin(process.argv))
.scriptName("slot")
.command("init", "Initialise a new repository", {}, initRepo)
  .command(
    "add <file>",
    "Add a file or all modified/new files and folders to the repository",
    (yargs) => {
      yargs.positional("file", {
        describe: "File to add to the staging area. Use '.' to add all files.",
        type: "string",
      });
    },
    async (argv) => {
      if (argv.file === ".") {
        await addAllToRepo(); 
      } else {
        await addFileToRepo(argv.file); // Add a specific file
      }
    }
  )
    .command(
        "commit",
        "Commit the staged files",
        (yargs) => {
            yargs.option("m", {
                alias: "message",
                describe: "Commit message",
                type: "string",
                demandOption: true, // Makes the -m flag mandatory
            });
        },
        (argv) => {
            commitRepo(argv.message);
        }
    )
.command("push", "Push commits to CodeSlot", {}, pushRepo)
.command("pull", "Pull commits from CodeSlot", {}, (args) =>pullRepo(false))
.command("clone <url>", "Clone commits from CodeSlot", {}, (args) => pullRepo(args.url))

.command(
    "revert <commitID>",
    "Revert to a specific commit",
    (yargs) => {
        yargs.positional("commitID", {
            describe: "Commit ID to revert to",
            type: "string",
        });
    },
    (argv) => {
        revertRepo(argv.commitID);
    }
)
.command(
    "remote [action] [url]",
    "Manage remotes",
    (yargs) => {
        yargs
            .positional("action", {
                describe: "Action to perform (add, remove, list)",
                type: "string",
                choices: ["add", "remove"],
            })
            .option("url", {
                describe: "URL of the remote repository (required for add)",
                type: "string",
            });
    },
    (argv) => {
        const { action, url } = argv;

        // Handle subcommands based on `action`
        if (!action) {
            listRemote();}
            
       else if (action === "add") {
            if (!url) {
                console.error("Error: --url is required for the 'add' action.");
                process.exit(1);
            }
            addRemote(url);
        } else if (action === "remove") {
            removeRemote();
        } else {
            console.error(`Unknown action: ${action}`);
            process.exit(1);
        }
    }
)
.command(
    "auth",
    "Authenticate with your username and password",
    {},
    async () => {
        try {
            await authenticateUser();
        } catch (err) {
            console.error("Authentication failed.");
            process.exit(1);
        }
    }
)
.command("log", "Show commit logs", {},  (argv) => {
    commitLogs();
})
.command(
    "*", // This wildcard catches any unknown command
    "Show help",
    (argv) => {
        console.error("Invalid command");
        console.log("Commands:");
        const commands = [
            ["slot init", "Initializes a new repository."],
            ["slot add <file>", "Adds a specific file to staging."],
            ["slot add .", "Adds all modified/new files and folders to staging."],
            ["slot commit -m \"message\"", "Commits staged files (message required)."],
            ["slot push", "Pushes commits to the repository."],
            ["slot pull", "Pulls the latest changes from the repository."],
            ["slot revert <commitID>", "Reverts to a specific commit."],
            ["slot remote add <url>", "Adds a new remote."],
            ["slot remote remove", "Removes the remote."],
            ["slot remote", "Lists all remotes."],
            ["slot auth", "Authenticates the user."],
            ["slot log", "Shows commit history."]
        ];
        
        const maxCommandLength = Math.max(...commands.map(cmd => cmd[0].length)); // Find the longest command
        
        commands.forEach(([cmd, desc]) => {
            console.log(cmd.padEnd(maxCommandLength + 10) + desc); // Adjust padding
        });
        console.log("\nUse 'slot --help' to view this message anytime.\n");
       
        process.exit(1);
    }
)
.demandCommand(1, "You need at least one command")
.help().argv;
