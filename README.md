# Slot-Version Control System
<img src="public/slot-logo.png" alt="slot-logo" width="95" height="95"/>

Slot-VCS (referred to as Slot) is an NPM package that provides a version control system designed for simplicity and efficiency. It allows users to track file changes, commit updates, and collaborate using remote repositories hosted on [CodeSlot](https://codeslot.in).

All repository data is securely stored in an **AWS S3 bucket**, ensuring reliability and scalability.

You can view your repository on [CodeSlot](https://codeslot.in), see all the commits, and check how your repository looked before at any point in time.

## Compatibility

**Note:** Slot-VCS is compatible only with **Windows**, as it relies on **inode**, which is not fully supported on other operating systems. 

Versions for other operating systems are **coming soon.**

## Installation
Slot-VCS must be installed **globally** on your system. To install, run

```sh
npm install -g slot-vcs
```

## Getting Started
After installation, create an account on [CodeSlot](https://codeslot.in), which stores your repositories. Once registered, you can initialize a repository and start tracking files.

```sh
slot init  # Initialize a new repository
```

## Commands
Slot-VCS provides various commands to manage your repository. Here’s a list of the main commands:

### Initialize Repository
```sh
slot init
```
Initializes a new repository in the current directory.

### Add Files to Staging
```sh
slot add <file>
```
Stages a specific file for commit.

```sh
slot add .
```
Stages all modified and new files.

<img src="public/addDemo.png" alt="add-img"/>

### Commit Changes
```sh
slot commit -m "Your commit message"
```
Commits the staged files with a message.

<img src="public/commitDemo.png" alt="commit-img"/>

### Push Commits
```sh
slot push
```
Pushes committed changes to the remote repository on CodeSlot.

<img src="public/pushDemo.png" alt="push-img"/>

### Pull Changes
```sh
slot pull
```
Pulls the latest changes from the remote repository on CodeSlot.

<img src="public/pullDemo.png" alt="pull-img"/>

### Clone Repository
```sh
slot clone <url>
```
Clones a repository from the specified URL.

<img src="public/cloneDemo.png" alt="clone-img"/>

### View Commit History
```sh
slot log
```
Displays the commit history of the repository.

### Revert to a Specific Commit
```sh
slot revert <commitID>
```
Reverts the repository to a specified commit.

### Manage Remote Repositories
```sh
slot remote add <url>
```
Adds a new remote repository.

```sh
slot remote remove
```
Removes the existing remote repository.

```sh
slot remote
```
Lists the remote repository.

### Authenticate User
```sh
slot auth
```
Authenticates the user with their credentials on CodeSlot.

## Help
To view the list of available commands, run:

```sh
slot --help
```
## View Your Repository on CodeSlot
<img src="public/codeslotRepo.png" alt="codeslot-repo"/>

## License
Slot-VCS is open-source and available under the MIT License.

