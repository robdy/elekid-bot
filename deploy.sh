#!/bin/bash
cd /var/www/elekid-prod
git pull
yarn install
pm2 reload elekid