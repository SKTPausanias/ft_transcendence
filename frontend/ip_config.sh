#!/bin/sh
echo Changing localhost to $IP
if [ -z "$IP" ] 
	then
		sed -i -- 's/localhost/backend/g' proxy.conf.json
else
	sed -i -- 's/localhost/'$IP'/g' proxy.conf.json
	sed -i -- 's/localhost/'$IP'/g' src/environments/environment.ts
fi
