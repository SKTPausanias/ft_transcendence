#!/bin/sh
echo Changing localhost to $IP
if [ -z "$IP" ] 
	then
		sed -i -- 's/ft_db/db/g' .env
		sed -i -- 's/ft_frontend/localhost/g' .env
		sed -i -- 's/ft_backend/backend/g' .env
else
		sed -i -- 's/ft_db/'$IP'/g' .env
		sed -i -- 's/ft_frontend/'$IP'/g' .env
		sed -i -- 's/ft_backend/'$IP'/g' .env
fi
