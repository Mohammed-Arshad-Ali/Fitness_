# How to Push VITA:ON to GitHub

You have initialized the repository and staged the files. Now follow these steps:

### 1. Configure Identity (If not done)
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 2. Commit the Code
```bash
git commit -m "Initial commit: VITA:ON Liquid Biology 3D Dashboard"
```

### 3. Connect to GitHub
Replace `YOUR_REPO_URL` with the link from GitHub (e.g., https://github.com/username/vitaon.git)
```bash
git remote add origin YOUR_REPO_URL
git branch -M main
git push -u origin main
```
