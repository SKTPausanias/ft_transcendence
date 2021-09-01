#!/bin/bash
root=$(pwd)
sback_path="./ft_transcendence/backend"
sfront_path="./ft_transcendence/frontend"
front_path="./deploy/frontend"
back_path="./deploy/backend"
ft_transcendence="./ft_transcendence"
deploy="./deploy"
clone='https://puthereyourgituser@github.com/SKTPausanias/ft_transcendence'
needDependencies=false
backDependencies=false
frontDependencies=false

if ! [ -d $ft_transcendence ]
then
	echo "Clonning the repository to: "$ft_transcendence "..."
	git clone $clone
else
	echo "Pulling changes..."
	cd $ft_transcendence
	git pull
	cd $root
fi

echo "Checking skeleton of deploy..."
if ! [ -d $deploy ]
then
	echo "Making dir: " $deploy
	mkdir $deploy
	echo "Changing to deploy directory"
	cd $deploy
	echo "Creating nestjs structure..."
	nest new backend
	echo "Creating angular structure..."
	ng new frontend
	cd $root
	needDependencies=true
	backDependencies=true
	frontDependencies=true
else
	cd $deploy
	if ! [ -d './backend' ]
	then
		echo "Creating nestjs structure..."
		nest new backend
		backDependencies=true
	fi
	if ! [ -d './frontend' ]
	then
		echo "Creating angular structure..."
		ng new frontend
		frontDependencies=true
	fi

	cd $root
fi

cd $root

if [ -d $back_path ] && [ -d "${back_path}/src" ]
then
	echo "Removing src folder from deploy/backend"
	rm -rf "${back_path}/src"
fi

if [ -d $front_path ] && [ -d "${front_path}/src" ]
then
	echo "Removing src folder from deploy/frontend"
	rm -rf "${front_path}/src"
fi

echo "Copying sources..."

if ! [ -d $sback_path ] 
then
	echo "Nothing can be coppied from:" $sback_path
else
	echo "copy backend sources from:" $sback_path
	cp -R "${sback_path}/src" "${back_path}/"
	cp $(ls ${sback_path}/*.json) "${back_path}/"
fi

if ! [ -d $sfront_path ]
then
	echo "Nothing can be coppied from:" $sfront_path
else
	echo "copy frontend sources from:" $sback_path
	cp -R "${sfront_path}/src" "${front_path}/"
	cp $(ls ${sfront_path}/*.json) "${front_path}/"
fi

echo "Checking dependencies..."

if [ $needDependencies = true ] || [ $backDependencies = true ] || [ $frontDependencies = true ]
then
	echo "Installing dependencies..."
	
	if [ $backDependencies = true ]
	then
		cd "${root}/${front_path}"
		npm install --save @nestjs/typeorm typeorm mysql2
		npm i --save @nestjs/config
		npm install pg --save
	fi
	
	if [ $frontDependencies = true ]
	then
		cd "${root}/${back_path}"
		npm install bootstrap jquery
		npm audit fix
	fi
else
	echo "Dependencies are allready installed"
fi

