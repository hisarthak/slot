# Slot-VCS - A Lightweight Version Control System
<img src="public/slot-logo.png" alt="slot-logo" width="75" height="75"/>
## Overview
Slot-VCS (referred to as Slot) is a lightweight version control system designed for simplicity and efficiency. It allows users to track file changes, commit updates, and collaborate using remote repositories hosted on [CodeSlot](https://codeslot.in).

## Compatibility

**Note:** Slot-VCS is compatible only with **Windows**, as it relies on **inode**, which is not fully supported on other operating systems. Additionally, Slot-VCS is built for **CommonJS (CJS) modules only.**

Versions for other operating systems and support for modules other than CJS are **coming soon.**

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

### Commit Changes
```sh
slot commit -m "Your commit message"
```
Commits the staged files with a message.

### Push Commits
```sh
slot push
```
Pushes committed changes to the remote repository on CodeSlot.

### Pull Changes
```sh
slot pull
```
Pulls the latest changes from the remote repository on CodeSlot.

### Clone Repository
```sh
slot clone <url>
```
Clones a repository from the specified URL.

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

## License
Slot-VCS is open-source and available under the MIT License.

