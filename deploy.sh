#!/bin/bash
cd /var/www/elekid-prod
git pull
npm install
pm2 reload elekid
