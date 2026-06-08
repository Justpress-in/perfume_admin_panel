# Admin Panel Deployment Commands & Guide

This file contains the complete step-by-step commands to deploy the Vite React Admin Panel (`/Users/gauravpawar/Desktop/perfume/admin-panel`) from GitHub to your Hostinger VPS serving `admin.oudalanood.com`.

---

## Step 1: Clone the Admin Panel on the VPS

Log into your VPS (or if you are already in the terminal), run this command to clone the admin panel codebase:

```bash
git clone https://github.com/Justpress-in/perfume_admin_panel.git /var/www/perfume-admin
```

---

## Step 2: Install Dependencies & Build

```bash
# 1. Enter the admin panel folder
cd /var/www/perfume-admin

# 2. Install all development & production dependencies
npm install

# 3. Create the production environment variables file
nano .env
```

Paste this single environment variable pointing to your production API backend:

```env
VITE_API_BASE_URL=https://api.oudalanood.com
```

*Press `Ctrl+O` then `Enter` to save, and `Ctrl+X` to exit.*

Now, run the build script to generate the static files:

```bash
# 4. Build the project
npm run build
```

*(This compiles your react application and generates static assets inside `/var/www/perfume-admin/dist/`)*

---

## Step 3: Configure Nginx to Serve the Admin Panel

```bash
# 1. Create a new Nginx configuration file
nano /etc/nginx/sites-available/perfume-admin
```

Paste the following Nginx block. This directs requests for `admin.oudalanood.com` to the built `dist` folder, and routes all fallback paths to `index.html` (crucial for React Router SPA navigation):

```nginx
server {
    listen 80;
    server_name admin.oudalanood.com;

    root /var/www/perfume-admin/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

*Press `Ctrl+O` then `Enter` to save, and `Ctrl+X` to exit.*

Now, enable the site and reload Nginx:

```bash
# 2. Link the site configuration to sites-enabled
ln -s /etc/nginx/sites-available/perfume-admin /etc/nginx/sites-enabled/

# 3. Test configuration syntax (should report successful)
nginx -t

# 4. Restart Nginx to load configuration
systemctl restart nginx
```

---

## Step 4: Secure the Connection with SSL (Let's Encrypt)

Run Certbot to request a free SSL certificate for the admin domain:

```bash
certbot --nginx -d admin.oudalanood.com
```

*(Enter your preferences when prompted. Certbot will automatically rewrite the Nginx config to use HTTPS and reload it.)*

---

## Step 5: Verification

Visit your browser at:
`https://admin.oudalanood.com`

---

## Maintenance Cheatsheet

If you update the Admin Panel in the future:
1. Push your changes to your GitHub repo.
2. SSH into the VPS: `ssh root@72.62.198.120`.
3. Pull updates, install packages, and rebuild:
   ```bash
   cd /var/www/perfume-admin
   git pull
   npm install
   npm run build
   ```
   *(No Nginx or Certbot reload is needed for file changes, they serve instantly from `/dist`)*
