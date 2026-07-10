#!/bin/bash
# Start the kontrakku server for ms.mydrecords.com
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR/server"
PORT=8080 node index.js
