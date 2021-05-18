# Composer

A quote from composer website that describes the tool ([https://getcomposer.org](https://getcomposer.org)):

"Composer is a tool for dependency management in PHP. It allows you to declare the libraries your project depends on and it will manage (install/update) them for you."

## Installation

**Note:** Windows users please use a unix shell like `Windows Subsystem for Linux`([https://docs.microsoft.com/en-us/windows/wsl/install-win10](https://docs.microsoft.com/en-us/windows/wsl/install-win10)) or `git bash`([https://git-scm.com/downloads](https://git-scm.com/downloads))

1. Run the commands as described here: [https://getcomposer.org/download/](https://getcomposer.org/download/) (the commands changed from time to time based on the composer version).

2. Move the bin that was created to `usr/bin` directory to allow use composer globally: `mv ./composer.phar /usr/bin/composer` (maybe require sudo permission).

3. Run: `composer -v` and make sure it returns the expected version, if not restart your shell client.

4. `cd` into Elementor root directory and run `composer install`

 
