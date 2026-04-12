#!/bin/sh

INDEX=/usr/share/nginx/html/index.html

if [ -n "$API_URL" ]; then
  sed -i "s|<script src=\"bundle.js\"></script>|<script>window.ENV_API_URL='${API_URL}';</script><script src=\"bundle.js\"></script>|" $INDEX
fi

nginx -g "daemon off;"