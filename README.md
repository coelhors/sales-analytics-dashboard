﻿# Git Commands Cheat Sheet

This guide contains essential Git commands your team will use while working on the **Sales Analytic Dashboard** project. Each command is explained with its purpose to ensure smooth collaboration.

---

## **1. Initial Setup**
### Clone the Repository
```bash
git clone https://github.com/your-username/Sales-Analytic-Dashboard.git
```
- **Purpose**: Downloads the repository to your local machine and creates a folder with the project files.

### Navigate to the Project Folder
```bash
cd Sales-Analytic-Dashboard
```
- **Purpose**: Changes the current directory to the project folder.

---

## **2. Branch Management**
### Create a New Branch
```bash
git checkout -b feature/branch-name
```
- **Purpose**: Creates and switches to a new branch for your feature or task.

### Switch to an Existing Branch
```bash
git checkout branch-name
```
- **Purpose**: Switches to the specified branch.

### View All Branches
```bash
git branch
```
- **Purpose**: Lists all local branches. Use `git branch -a` to see remote branches as well.

---

## **3. Making Changes**
### Check Current Status
```bash
git status
```
- **Purpose**: Shows the status of your working directory, including modified files and untracked files.

### Add Changes to Staging Area
```bash
git add .
```
- **Purpose**: Stages all changes in your current directory.

### Commit Changes
```bash
git commit -m "Your commit message here"
```
- **Purpose**: Saves the staged changes with a message describing what was done.

---

## **4. Synchronizing with Remote**
### Pull the Latest Changes
```bash
git pull origin branch-name
```
- **Purpose**: Updates your local branch with the latest changes from the remote branch.

### Push Changes to Remote
```bash
git push origin branch-name
```
- **Purpose**: Pushes your local commits to the remote repository.

---

## **5. Merging Changes**
### Merge a Branch into Another
```bash
git checkout target-branch
git merge source-branch
```
- **Purpose**: Combines the changes from `source-branch` into `target-branch`.

---

## **6. Handling Conflicts**
### Check for Merge Conflicts
If there are conflicts after pulling or merging, Git will notify you. Open the conflicting files, resolve the issues, then run:
```bash
git add resolved-file
git commit -m "Resolve merge conflict"
```
- **Purpose**: Marks the conflict as resolved and commits the changes.

---

## **7. Miscellaneous**
### View Commit History
```bash
git log --oneline
```
- **Purpose**: Displays a condensed history of commits.

### Undo Changes (Before Committing)
```bash
git checkout -- file-name
```
- **Purpose**: Discards changes in the specified file and restores it to the last committed state.

### Delete a Branch (Locally)
```bash
git branch -d branch-name
```
- **Purpose**: Deletes the specified branch locally after it has been merged.

---

## **8. Best Practices**
- **Always Pull Before Pushing**: Ensure your local branch is up-to-date with remote changes.
- **Commit Often**: Make small, frequent commits with clear messages.
- **Work on Feature Branches**: Always create a new branch for your tasks and merge it into `development` or `main` when completed.
- **Resolve Conflicts Promptly**: If conflicts occur, resolve them as soon as possible.

---


