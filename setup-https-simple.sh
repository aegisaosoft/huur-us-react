#!/bin/bash

# Stop and remove current nginx
docker stop huur-us-nginx 2>/dev/null || true
docker rm huur-us-nginx 2>/dev/null || true

# Create SSL certificates
mkdir -p /share/ssl-certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /share/ssl-certs/nginx.key \
  -out /share/ssl-certs/nginx.crt \
  -subj '/C=US/ST=State/L=City/O=Organization/CN=192.168.1.134'

# Create nginx container with SSL
docker run -d --name huur-us-nginx \
  -p 9443:443 \
  -v /share/ssl-certs:/etc/ssl/certs \
  -v /share/ssl-certs:/etc/ssl/private \
  nginx:alpine

# Create HTTPS config
cat > /tmp/nginx-https.conf << 'EOF'
server {
    listen 443 ssl;
    server_name localhost;
    
    ssl_certificate /etc/ssl/certs/nginx.crt;
    ssl_certificate_key /etc/ssl/certs/nginx.key;
    
    location / {
        proxy_pass http://192.168.1.134:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Copy config to container
docker cp /tmp/nginx-https.conf huur-us-nginx:/etc/nginx/conf.d/default.conf

# Restart nginx
docker restart huur-us-nginx

echo "HTTPS setup complete! Access via https://192.168.1.134:9443"
