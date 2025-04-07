
# Script to copy required files to the frontend project
# Usage: ./copy_files.ps1 <project_name>


# Get arguments from command line
param(
  [Parameter(Mandatory = $true)]
  [string]$project_name
)

$frontend_root = "./projects/$project_name-frontend"

# Ensure directories exist
New-Item -Path "$frontend_root/src/components" -ItemType Directory -Force

# Copy files
Copy-Item -Path "./inject_content/Home.tsx" -Destination "$frontend_root/src/Home.tsx" -Force
Copy-Item -Path "./inject_content/AppCalls.tsx" -Destination "$frontend_root/src/components/AppCalls.tsx" -Force

Write-Host "Template completed successfully!"
# remove inject_content folder
Remove-Item -Recurse -Force "./inject_content"
# self destruct the file
Remove-Item $MyInvocation.MyCommand.Path


