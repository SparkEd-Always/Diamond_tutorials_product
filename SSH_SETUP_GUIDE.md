# SSH Setup Guide
## Sparked EdTech Platform - Git & GitHub SSH Configuration

**Created**: October 13, 2025
**Purpose**: Set up SSH for secure Git operations

---

## 🎯 What is SSH?

SSH (Secure Shell) allows you to connect to GitHub securely without entering your password every time you push/pull code.

**Benefits**:
- ✅ No password prompts
- ✅ More secure than HTTPS
- ✅ Required for many Git operations
- ✅ Industry standard

---

## 📋 Quick Setup (5 Steps)

### Step 1: Check if SSH Key Already Exists

Open **Git Bash** (or Terminal on Mac/Linux):

```bash
ls -al ~/.ssh
```

**Look for these files**:
- `id_rsa` or `id_ed25519` (private key)
- `id_rsa.pub` or `id_ed25519.pub` (public key)

**If you see these files**: Skip to Step 3
**If you don't see these files**: Continue to Step 2

---

### Step 2: Generate New SSH Key

#### Option A: Using Ed25519 (Recommended - More Secure)

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

#### Option B: Using RSA (If Ed25519 not supported)

```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

**When prompted**:

1. **"Enter a file in which to save the key"**:
   - Just press `Enter` (uses default location: `~/.ssh/id_ed25519`)

2. **"Enter passphrase"**:
   - Press `Enter` for no passphrase (easier)
   - OR type a secure passphrase (more secure)

3. **"Enter same passphrase again"**:
   - Press `Enter` again (or re-type passphrase)

**Output**:
```
Your identification has been saved in /c/Users/YourName/.ssh/id_ed25519
Your public key has been saved in /c/Users/YourName/.ssh/id_ed25519.pub
The key fingerprint is:
SHA256:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx your_email@example.com
```

✅ **SSH key pair created!**

---

### Step 3: Start SSH Agent

```bash
eval "$(ssh-agent -s)"
```

**Output**:
```
Agent pid 12345
```

---

### Step 4: Add SSH Key to Agent

#### If using Ed25519:
```bash
ssh-add ~/.ssh/id_ed25519
```

#### If using RSA:
```bash
ssh-add ~/.ssh/id_rsa
```

**Output**:
```
Identity added: /c/Users/YourName/.ssh/id_ed25519 (your_email@example.com)
```

---

### Step 5: Add SSH Key to GitHub

#### 5.1: Copy SSH Public Key

**Windows (Git Bash)**:
```bash
cat ~/.ssh/id_ed25519.pub | clip
```

**Mac**:
```bash
pbcopy < ~/.ssh/id_ed25519.pub
```

**Linux**:
```bash
cat ~/.ssh/id_ed25519.pub
# Then manually copy the output
```

**OR manually copy**:
```bash
cat ~/.ssh/id_ed25519.pub
```

Copy everything from `ssh-ed25519` to the end (including your email).

Example output:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGQr+FJZxxxxxxxxxxxxxxxxxxxxxxxxxxx your_email@example.com
```

#### 5.2: Add to GitHub

1. Go to GitHub: https://github.com
2. Click your **profile picture** (top right) → **Settings**
3. In the left sidebar, click **SSH and GPG keys**
4. Click **New SSH key** (green button)
5. Fill in:
   - **Title**: `My Laptop` (or any descriptive name)
   - **Key type**: `Authentication Key`
   - **Key**: Paste your SSH public key (from clipboard)
6. Click **Add SSH key**
7. Confirm with your GitHub password if prompted

✅ **SSH key added to GitHub!**

---

### Step 6: Test SSH Connection

```bash
ssh -T git@github.com
```

**First time?** You'll see:
```
The authenticity of host 'github.com (IP)' can't be established.
ED25519 key fingerprint is SHA256:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

Type: **`yes`** and press Enter

**Success message**:
```
Hi YourUsername! You've successfully authenticated, but GitHub does not provide shell access.
```

✅ **SSH is working!**

---

## 🔧 Configure Git to Use SSH

### For New Repository

When cloning, use SSH URL instead of HTTPS:

**SSH URL** (Use this):
```bash
git clone git@github.com:username/repository.git
```

**HTTPS URL** (Don't use):
```bash
git clone https://github.com/username/repository.git
```

---

### For Existing Repository (Switch HTTPS to SSH)

If you already cloned with HTTPS, switch to SSH:

```bash
cd d:\Projects\sparked

# Check current remote URL
git remote -v

# If it shows https://, change to SSH:
git remote set-url origin git@github.com:username/sparked.git

# Verify it changed
git remote -v
```

**Output should show**:
```
origin  git@github.com:username/sparked.git (fetch)
origin  git@github.com:username/sparked.git (push)
```

---

## 📁 Initialize Git Repository for Sparked Project

### Step 1: Initialize Git

```bash
cd d:\Projects\sparked
git init
```

### Step 2: Create .gitignore (if not exists)

Already created in each project folder, but you can create a root one:

```bash
# Create root .gitignore
cat > .gitignore << 'EOF'
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
venv/
env/
*.db
*.sqlite

# Node
node_modules/
dist/
.env
.env.local

# IDEs
.vscode/
.idea/
*.swp
.DS_Store

# Logs
*.log
logs/

# OS
Thumbs.db
.DS_Store

# Uploads
uploads/
documents/
EOF
```

### Step 3: Add Files to Git

```bash
git add .
```

### Step 4: Create First Commit

```bash
git commit -m "Initial commit: Sparked EdTech Platform

- Journey 1: Admission System (Production Ready)
- Journey 2: Fee Management System (Setup Complete)
- Complete documentation (350+ pages)
- Module Development Guide

🚀 Generated with Claude Code"
```

### Step 5: Create GitHub Repository

1. Go to https://github.com/new
2. Fill in:
   - **Repository name**: `sparked`
   - **Description**: `EdTech ERP + SIS + LMS for Indian Schools`
   - **Visibility**: `Private` (recommended) or `Public`
   - **DON'T** initialize with README (we already have files)
3. Click **Create repository**

### Step 6: Connect Local to GitHub

GitHub will show commands. Use the **SSH** version:

```bash
# Add remote
git remote add origin git@github.com:yourusername/sparked.git

# Push code
git branch -M main
git push -u origin main
```

**First push output**:
```
Enumerating objects: 100, done.
Counting objects: 100% (100/100), done.
Delta compression using up to 8 threads
Compressing objects: 100% (85/85), done.
Writing objects: 100% (100/100), 1.23 MiB | 2.45 MiB/s, done.
Total 100 (delta 10), reused 0 (delta 0), pack-reused 0
To github.com:yourusername/sparked.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

✅ **Code pushed to GitHub!**

---

## 🚀 Daily Git Workflow (After SSH Setup)

### Pull Latest Changes

```bash
git pull origin main
```

### Make Changes, Commit, and Push

```bash
# Check what changed
git status

# Add files
git add .

# Commit with message
git commit -m "feat: add fee types management API"

# Push to GitHub
git push origin main
```

**No password required!** ✅

---

## 🔐 Security Best Practices

### 1. Protect Your Private Key

**NEVER share these files**:
- `~/.ssh/id_ed25519` (private key)
- `~/.ssh/id_rsa` (private key)

**Safe to share**:
- `~/.ssh/id_ed25519.pub` (public key)

### 2. Use Passphrase (Recommended)

When generating SSH key, use a strong passphrase:
- Adds extra security layer
- Protects key if laptop is stolen
- You'll enter it once per session

### 3. Different Keys for Different Machines

Generate separate SSH keys for:
- Laptop
- Desktop
- Work computer

Add all public keys to GitHub (Settings → SSH keys)

### 4. Regularly Rotate Keys

- Generate new SSH key every 1-2 years
- Remove old keys from GitHub

---

## 🐛 Troubleshooting

### Issue 1: "Permission denied (publickey)"

**Cause**: SSH key not added to GitHub or SSH agent

**Solution**:
```bash
# Check if key is added to agent
ssh-add -l

# If empty, add key
ssh-add ~/.ssh/id_ed25519

# Test connection
ssh -T git@github.com
```

---

### Issue 2: "Could not open a connection to your authentication agent"

**Cause**: SSH agent not running

**Solution**:
```bash
# Start SSH agent
eval "$(ssh-agent -s)"

# Add key
ssh-add ~/.ssh/id_ed25519
```

---

### Issue 3: "Host key verification failed"

**Cause**: GitHub's host key changed (rare) or first connection

**Solution**:
```bash
# Remove old host key
ssh-keygen -R github.com

# Try connecting again
ssh -T git@github.com
# Type 'yes' when prompted
```

---

### Issue 4: Git Still Asking for Password

**Cause**: Repository using HTTPS instead of SSH

**Solution**:
```bash
# Check remote URL
git remote -v

# If shows https://, change to SSH
git remote set-url origin git@github.com:username/sparked.git
```

---

### Issue 5: "Bad owner or permissions" (Windows)

**Cause**: SSH folder permissions too open

**Solution**:
```bash
# In Git Bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub
```

---

## 📋 SSH Key Management

### List All SSH Keys in Agent

```bash
ssh-add -l
```

### Remove All Keys from Agent

```bash
ssh-add -D
```

### Add Key with Different Name

```bash
ssh-add ~/.ssh/custom_key_name
```

### Generate Multiple SSH Keys (Work vs Personal)

**Personal GitHub**:
```bash
ssh-keygen -t ed25519 -C "personal@email.com" -f ~/.ssh/id_ed25519_personal
```

**Work GitHub**:
```bash
ssh-keygen -t ed25519 -C "work@email.com" -f ~/.ssh/id_ed25519_work
```

**Configure SSH to use different keys**:
Create `~/.ssh/config`:
```
# Personal GitHub
Host github.com-personal
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_personal

# Work GitHub
Host github.com-work
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_work
```

**Clone with specific key**:
```bash
# Personal
git clone git@github.com-personal:username/repo.git

# Work
git clone git@github.com-work:company/repo.git
```

---

## 🎯 Quick Reference

### Generate SSH Key
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

### Start SSH Agent
```bash
eval "$(ssh-agent -s)"
```

### Add Key to Agent
```bash
ssh-add ~/.ssh/id_ed25519
```

### Copy Public Key (Windows)
```bash
cat ~/.ssh/id_ed25519.pub | clip
```

### Test GitHub Connection
```bash
ssh -T git@github.com
```

### Clone with SSH
```bash
git clone git@github.com:username/repository.git
```

### Switch Remote from HTTPS to SSH
```bash
git remote set-url origin git@github.com:username/repository.git
```

---

## ✅ Verification Checklist

After completing setup, verify:

- [ ] SSH key generated (check `~/.ssh/`)
- [ ] SSH agent running (`ssh-add -l` shows key)
- [ ] Public key added to GitHub (Settings → SSH keys)
- [ ] GitHub connection works (`ssh -T git@github.com`)
- [ ] Git remote uses SSH (`git remote -v` shows `git@github.com`)
- [ ] Can push without password (`git push origin main`)

---

## 📚 Additional Resources

### Official Docs
- **GitHub SSH Guide**: https://docs.github.com/en/authentication/connecting-to-github-with-ssh
- **Git Documentation**: https://git-scm.com/book/en/v2/Git-on-the-Server-Generating-Your-SSH-Public-Key

### Video Tutorials
- Search YouTube: "GitHub SSH setup"

### Git GUI Tools (Alternative to Command Line)
- **GitHub Desktop**: https://desktop.github.com/ (Easy GUI)
- **GitKraken**: https://www.gitkraken.com/ (Advanced GUI)
- **Sourcetree**: https://www.sourcetreeapp.com/ (Free)

---

## 🎊 Success!

You're now ready to use Git with SSH!

**Next Steps**:
1. ✅ Push your code to GitHub
2. ✅ Start developing modules
3. ✅ Commit regularly (`git commit -m "message"`)
4. ✅ Push to backup (`git push origin main`)

**No more password prompts!** 🚀

---

**Last Updated**: October 13, 2025
**Status**: Complete SSH Setup Guide
**Difficulty**: Beginner-Friendly

*Secure, fast, and password-free Git operations!*
