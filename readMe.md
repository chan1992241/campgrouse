MongoDB installation WSL2 Ubuntu
========
1. sudo apt update
2. sudo apt-get install mongodb
3. cd /
4. sudo mkdir -p data/db
5. sudo chown -R \`id -un\` data/db
6. sudo chown \`whoami\` /tmp/mongodb-27017.sock
7. mongod -- start mongodb service
8. mongo -- run mongo command in another terminal
9. can also try "sudo mongod &" to start mongo
10. sudo uninstall mongodb