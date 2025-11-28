FROM nginx:stable-alpine
COPY index.html /usr/share/nginx/html/index.html
# Expose port 80 (optional, just documentation)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
