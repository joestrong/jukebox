#!/usr/bin/env bash

echo "-------------------------------------------------"
echo "				JUKEBOX INSTALLER"
echo "					  v0.0.1"
echo "-------------------------------------------------"

# Ask the user for the details
read -e -p "Path to the config file: " -i "$HOME/.jukebox" CONFIG_PATH

# Check if the config file already exists
if [ -f "$CONFIG_PATH" ]; then
	echo "The config file already exists, overwrite?"
	select yn in "Yes" "No"; do
		case $yn in
			Yes ) break;;
			No ) exit;;
		esac
	done
fi

# Ask for the MySQL details
read -e -p "MySQL username: " MYSQL_USER
read -e -p "MySQL hostname: " -i "localhost" MYSQL_HOST
read -e -p "MySQL password: " MYSQL_PASS
MYSQL_DATABASE="jukebox"

# Set the file names
FILE_QUEUE="queue_list"
FILE_RESOLVE="resolve_list"

# Set the player
PLAYER="omxplayer"

# Write the details
echo "MYSQL_USER=$MYSQL_USER" >> "$CONFIG_PATH"
echo "MYSQL_HOST=$MYSQL_HOST" >> "$CONFIG_PATH"
echo "MYSQL_PASS=$MYSQL_PASS" >> "$CONFIG_PATH"
echo "MYSQL_DATABASE=$MYSQL_DATABASE" >> "$CONFIG_PATH"
echo "FILE_QUEUE=$FILE_QUEUE" >> "$CONFIG_PATH"
echo "FILE_RESOLVE=$FILE_RESOLVE" >> "$CONFIG_PATH"
echo "PLAYER=$PLAYER" >> "$CONFIG_PATH"
