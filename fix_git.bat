@echo off
git init
git add .
git commit -m "Initial commit with all fixes"
git branch -M main
git remote remove origin >nul 2>&1
git remote add origin https://github.com/kaitottom/Grow-steps.git
git branch
git log -n 1
