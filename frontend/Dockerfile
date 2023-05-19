# Base image
FROM nginx:alpine

RUN mkdir -p /app

WORKDIR /app

# Remove the default Nginx configuration
RUN rm -rf /etc/nginx/conf.d/*

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/


# Remove the previous assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the webpack assets
COPY public /usr/share/nginx/html

COPY .env .env

# Expose the desired port (e.g., 80)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]