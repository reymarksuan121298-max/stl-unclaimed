# PowerShell script to help set up Vercel Environment Variables
# Run this to see instructions for setting up your environment variables

Write-Host "Setting up Vercel Environment Variables..." -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: You need to add your Supabase credentials to Vercel" -ForegroundColor Yellow
Write-Host ""
Write-Host "Required Environment Variables:" -ForegroundColor Cyan
Write-Host "1. VITE_SUPABASE_URL"
Write-Host "2. VITE_SUPABASE_ANON_KEY"
Write-Host ""
Write-Host "Optional Environment Variables:" -ForegroundColor Cyan
Write-Host "3. VITE_GOOGLE_SCRIPT_URL_1"
Write-Host ""
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""
Write-Host "OPTION 1: Quick Setup via Vercel Dashboard (Easiest)" -ForegroundColor Green
Write-Host "1. Open: https://vercel.com/reymarksuan121298-maxs-projects/stl-unclaimed/settings/environment-variables"
Write-Host "2. Click 'Add New' for each variable"
Write-Host "3. Copy values from your local .env file"
Write-Host "4. Select 'Production, Preview, and Development' for each"
Write-Host "5. Click 'Save'"
Write-Host ""
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""
Write-Host "OPTION 2: Using Vercel CLI" -ForegroundColor Green
Write-Host "Run these commands and paste the values when prompted:"
Write-Host ""
Write-Host "vercel env add VITE_SUPABASE_URL production" -ForegroundColor White
Write-Host "vercel env add VITE_SUPABASE_ANON_KEY production" -ForegroundColor White
Write-Host ""
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""
Write-Host "After adding variables, redeploy with:" -ForegroundColor Yellow
Write-Host "vercel --prod" -ForegroundColor White
Write-Host ""
