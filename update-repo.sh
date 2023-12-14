cd /Library/WebServer/Documents/peptalk/peptalk-editor
echo "Changed directory to /Library/WebServer/Documents/peptalk/peptalk-editor"

# Make sure the script stops if an error occurs
set -e

# Update main branch with changes from the original Ghost repository
echo "Checking out the main branch..."
git checkout main
echo "Pulling changes from the upstream main branch..."
git pull origin main
echo "Changes pulled successfully."

echo "Pulling changes from the origin main..."
git pull codecommit main
echo "Changes pulled successfully from the origin main."


# Push updated main branch to your GitHub fork
echo "Pushing updates to GitHub fork..."
git push origin main
echo "Updates pushed to GitHub fork."

# Push updated main branch to AWS CodeCommit
echo "Pushing updates to AWS CodeCommit..."
git push codecommit main
echo "Updates pushed to AWS CodeCommit."

git pull codecommit main
git fetch
