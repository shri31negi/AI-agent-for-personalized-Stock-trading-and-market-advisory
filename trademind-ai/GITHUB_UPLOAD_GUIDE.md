# GitHub Upload Guide for TradeMind AI

## Prerequisites

1. **Git installed** on your computer
   - Check: `git --version`
   - Download from: https://git-scm.com/downloads

2. **GitHub account**
   - Sign up at: https://github.com

## Step-by-Step Guide

### Option 1: Upload Entire Project (Recommended)

#### Step 1: Create a New Repository on GitHub

1. Go to https://github.com
2. Click the **"+"** icon in the top-right corner
3. Select **"New repository"**
4. Fill in the details:
   - **Repository name**: `trademind-ai` (or your preferred name)
   - **Description**: "AI-powered trading companion with portfolio management and market analysis"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README (we already have one)
5. Click **"Create repository"**

#### Step 2: Initialize Git in Your Project

Open your terminal/command prompt and navigate to the trademind-ai folder:

```bash
cd path/to/trademind-ai
```

Initialize Git:

```bash
git init
```

#### Step 3: Add Files to Git

```bash
# Add all files
git add .

# Check what will be committed
git status
```

#### Step 4: Create First Commit

```bash
git commit -m "Initial commit: TradeMind AI trading application"
```

#### Step 5: Connect to GitHub

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

#### Step 6: Push to GitHub

```bash
# For first push
git branch -M main
git push -u origin main
```

---

### Option 2: Upload Only Frontend Folder

If you only want to upload the frontend folder:

#### Step 1: Create Repository (same as above)

#### Step 2: Navigate to Frontend Folder

```bash
cd path/to/trademind-ai/frontend
```

#### Step 3: Initialize and Push

```bash
git init
git add .
git commit -m "Initial commit: TradeMind AI frontend"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

---

## Important Files Included

### ✅ Already Created
- **README.md** - Complete documentation
- **.gitignore** - Excludes node_modules, .env, build files
- **.env.example** - Template for environment variables
- **package.json** - Dependencies and scripts

### 🚫 Excluded (via .gitignore)
- `node_modules/` - Dependencies (users will run `npm install`)
- `.env` - Environment variables (sensitive data)
- `dist/` - Build output
- `.vscode/` - Editor settings
- Log files

---

## After Uploading

### For Other Users to Run Your Project

They should:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   cd YOUR_REPO_NAME
   ```

2. **Navigate to frontend** (if you uploaded entire project):
   ```bash
   cd frontend
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. **Open in browser**:
   - Usually opens automatically at `http://localhost:5173`

---

## Environment Variables

### Current Status
Your app currently uses **mock data** and doesn't require any environment variables.

### When You Need .env File

When you integrate with real APIs later:

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your actual API keys:
   ```
   VITE_API_URL=https://your-api.com
   VITE_API_KEY=your_actual_key
   ```

3. **NEVER commit .env** to GitHub (it's already in .gitignore)

---

## Updating Your Repository

After making changes:

```bash
# Check what changed
git status

# Add changes
git add .

# Commit with message
git commit -m "Description of changes"

# Push to GitHub
git push
```

---

## Common Issues & Solutions

### Issue: "git: command not found"
**Solution**: Install Git from https://git-scm.com/downloads

### Issue: "Permission denied (publickey)"
**Solution**: Set up SSH keys or use HTTPS URL with personal access token

### Issue: "node_modules uploaded by mistake"
**Solution**: 
```bash
git rm -r --cached node_modules
git commit -m "Remove node_modules"
git push
```

### Issue: Large file size
**Solution**: The .gitignore already excludes large folders. If still too large, check for:
- Unnecessary files in src/
- Large images (compress them)
- Build artifacts

---

## Repository Best Practices

### 1. Add a License
Create a `LICENSE` file (MIT, Apache, etc.)

### 2. Add Contributing Guidelines
Create `CONTRIBUTING.md` if you want others to contribute

### 3. Use Branches
```bash
# Create feature branch
git checkout -b feature/new-feature

# After changes
git push origin feature/new-feature
```

### 4. Write Good Commit Messages
- ✅ "Add dark mode toggle to layout"
- ✅ "Fix portfolio table styling in light mode"
- ❌ "Update"
- ❌ "Changes"

### 5. Keep README Updated
Update README.md when you add new features

---

## GitHub Repository Settings

After uploading, configure:

1. **About Section**:
   - Add description
   - Add topics: `react`, `typescript`, `trading`, `ai`, `portfolio-management`
   - Add website URL (if deployed)

2. **GitHub Pages** (optional):
   - Settings → Pages
   - Deploy your app for free

3. **Branch Protection** (optional):
   - Protect main branch
   - Require pull request reviews

---

## Deployment Options

### Vercel (Recommended)
1. Go to https://vercel.com
2. Import your GitHub repository
3. Vercel auto-detects Vite
4. Click Deploy

### Netlify
1. Go to https://netlify.com
2. Connect GitHub repository
3. Build command: `npm run build`
4. Publish directory: `dist`

### GitHub Pages
```bash
npm run build
# Then push dist folder to gh-pages branch
```

---

## Quick Reference Commands

```bash
# Check status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Your message"

# Push to GitHub
git push

# Pull latest changes
git pull

# View commit history
git log

# Create new branch
git checkout -b branch-name

# Switch branches
git checkout branch-name
```

---

## Need Help?

- **Git Documentation**: https://git-scm.com/doc
- **GitHub Guides**: https://guides.github.com
- **Git Cheat Sheet**: https://education.github.com/git-cheat-sheet-education.pdf

---

**Ready to share your TradeMind AI project with the world! 🚀**
