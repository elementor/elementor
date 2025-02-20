#!/bin/bash

# Setup Xdebug on macOS

if ! command -v brew &>/dev/null; then
    echo "Homebrew not found. Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
    echo "Homebrew is already installed."
fi

# Install Xdebug
if php --ri xdebug &>/dev/null; then

	xdebug_version=$(php --ri xdebug | grep "Version" | awk '{print $3}')
	echo "Xdebug ${xdebug_version} is already installed"

else
	echo "Installing Xdebug..."
	pecl install xdebug

	 # Verify installation succeeded
	if ! php --ri xdebug &>/dev/null; then
		echo "Xdebug installation failed!" >&2
		exit 1
	fi

	echo "Xdebug installed successfully"
fi

# Configure Xdebug
PHP_VERSION=$(php -r "echo PHP_MAJOR_VERSION.'.'.PHP_MINOR_VERSION;")
XDEBUG_INI=$(php --ini | grep -oE '/.*ext-xdebug.ini')

echo " "
echo "Configuring Xdebug at $XDEBUG_INI"
echo " "

# Check if the file exists
if [ -f "$XDEBUG_INI" ]; then
    echo "Current contents of $XDEBUG_INI:"
    echo "---------------------------------"
    sudo cat "$XDEBUG_INI"
    echo "---------------------------------"
    echo " "

    # Ask for confirmation before overwriting
    read -p "Do you want to overwrite this file? (y/n): " confirm
    if [[ "$confirm" != "y" ]]; then
        echo "Operation canceled."
        exit 1
    fi
fi

# Overwrite the file
cat << EOF | sudo tee "$XDEBUG_INI" >/dev/null
[xdebug]
xdebug.idekey=PHPSTORM
xdebug.client_host=127.0.0.1
xdebug.client_port=9003
xdebug.mode=debug
xdebug.start_with_request=trigger
xdebug.log=/tmp/xdebug.log
EOF

brew services restart php

# Verify installations
echo -e "\nVerifications:"
echo "PHP version: $(php -v 2>/dev/null | grep -oE 'PHP [0-9]+\.[0-9]+\.[0-9]+')"
echo "Xdebug installed: $(php -v 2>/dev/null | grep -o 'Xdebug')"
echo "PHPUnit version: $(vendor/bin/phpunit --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')"

echo -e "\nSetup complete!\n"
