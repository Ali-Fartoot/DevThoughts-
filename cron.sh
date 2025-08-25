#!/bin/bash
# Create a wrapper script that sets environment variables and runs the sync script
cat > /run_sync.sh << 'EOF'
#!/bin/bash
# Set environment variables
export MONGO_HOST=mongodb
export ELASTIC_URL=elasticsearch
export ELASTIC_PORT=9200
export MONGO_PORT=27017
export MONGO_DB=devthoughts
export MONGO_INITDB_ROOT_USERNAME=root
export MONGO_INITDB_ROOT_PASSWORD=root

# Run the sync script
/usr/local/bin/python3 /app/cron/es_sync.py
EOF

chmod +x /run_sync.sh

echo "* * * * * /run_sync.sh >> /var/log/cron.log 2>&1" | crontab -
touch /var/log/cron.log
cron -f