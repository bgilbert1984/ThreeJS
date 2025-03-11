#!/bin/bash

# **INCORRECT SCRIPT - DO NOT USE**

VERSION="1.24.1"
DOWNLOAD_URL="https://dl.google.com/go/go${VERSION}.src.tar.gz"  # This *might* be correct

# Download
wget "$DOWNLOAD_URL" -O "go${VERSION}.src.tar.gz"

# Extract
tar -xzf "go${VERSION}.src.tar.gz"

# Compile (This section is almost certainly the problem)
cd go/src
./make.bash

# Install
sudo mv ../ /usr/local/go  #THIS IS INCORRECT
sudo rm "go${VERSION}.src.tar.gz"

# Add to PATH (This part is correct, but should be in .bashrc)
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc

echo "Go go${VERSION} installation completed."