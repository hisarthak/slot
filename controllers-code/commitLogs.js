const fs = require("fs").promises;
const path = require("path");

async function commitLogs() {
  const chalk = await import("chalk"); // Dynamically import chalk
  const repoPath = path.resolve(process.cwd(), ".slot", "logs.json");
  const slotFolderPath = path.resolve(process.cwd(), ".slot");
     const oldSnapshotPath = path.join(slotFolderPath, "oldsnapshot.json");
      try {
          await fs.access(oldSnapshotPath);
      } catch (error) {
          console.log(chalk.default.red("Error: Repository not initialized. Run 'slot init' first."));
          process.exit(1); // Exit the script
      }

  try {
    const data = await fs.readFile(repoPath, "utf-8");
    const commits = JSON.parse(data);

    console.log(chalk.default.magenta.bold("Commit Logs(Oldest to Newest):")); // Use `chalk.default`
    commits.forEach((commit) => {
      const commitDate = new Date(commit.date);

const formattedDate = commitDate.toLocaleString("en-US", {
  weekday: "short",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  year: "numeric",
  timeZone: "Asia/Kolkata",
  hour12: false,
});


      console.log(chalk.default.yellow("commit ",commit.commitID))
      console.log(chalk.default.blueBright("Date:", formattedDate, "+0530"));
      console.log(chalk.default.blueBright("Message: ", commit.message));
      
    });
  } catch (err) {
    if (err.code === "ENOENT") {
      console.error(chalk.default.red("No commits found. Make a commit first."));
    } else {
      console.error(chalk.default.red("Error"));
    }
  }
}

module.exports = { commitLogs };
