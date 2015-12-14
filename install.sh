#!/usr/bin/env bash

echo "-------------------------------------------------"
echo "                JUKEBOX INSTALLER"
echo "                      v0.0.2"
echo "-------------------------------------------------"

# Install APT packages
sudo apt-get update
sudo apt-get install -y apache2 nodejs nodejs-legacy npm vlc

# Install Youtube DL
curl https://yt-dl.org/downloads/2015.12.05/youtube-dl -o /usr/local/bin/youtube-dl
chmod a+rx /usr/local/bin/youtube-dl

# Ask the user for the details
read -e -p "Path to the config file: " -i "$HOME/.jukebox" CONFIG_PATH

# Check if the config file already exists
if [ -f "$CONFIG_PATH" ]; then
	echo "The config file already exists, overwrite?"
	select yn in "Yes" "No"; do
		case $yn in
			Yes ) echo -n > "$CONFIG_PATH"; break;;
			No ) exit;;
		esac
	done
fi
