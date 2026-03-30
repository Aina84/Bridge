#!/bin/bash
echo "starting project..."

(cd "$(dirname "$0")/script" && ./startBackend.sh) &

(cd "$(dirname "$0")/script" && ./startFrontend.sh) &

wait

echo "Les deux serveurs quittés"
