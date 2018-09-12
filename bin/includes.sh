#!/bin/bash

# credit: "https://github.com/WordPress/gutenberg"
# under GPL license

##
# Download from a remote source.
#
# Checks for the existence of curl and wget, then downloads the remote file using the first available option.
#
# @param {string} remote  The remote file to download.
# @param {string} [local] Optional. The local filename to use. If it isn't passed, STDOUT is used.
#
# @return {bool} Whether the download succeeded or not.
##
download() {
    if command_exists "curl"; then
        curl -s -o "${2:--}" "$1"
    elif command_exists "wget"; then
		wget -nv -O "${2:--}" "$1"
    fi
}

##
# Add error message formatting to a string, and echo it.
#
# @param {string} message The string to add formatting to.
##
error_message() {
	echo -en "\033[31mERROR\033[0m: $1"
}

##
# Add warning message formatting to a string, and echo it.
#
# @param {string} message The string to add formatting to.
##
warning_message() {
	echo -en "\033[33mWARNING\033[0m: $1"
}

##
# Add status message formatting to a string, and echo it.
#
# @param {string} message The string to add formatting to.
##
status_message() {
	echo -en "\033[32mSTATUS\033[0m: $1"
}

##
# Add formatting to an action string.
#
# @param {string} message The string to add formatting to.
##
action_format() {
	echo -en "\033[32m$1\033[0m"
}

##
# Check if the command exists as some sort of executable.
#
# The executable form of the command could be an alias, function, builtin, executable file or shell keyword.
#
# @param {string} command The command to check.
#
# @return {bool} Whether the command exists or not.
##
command_exists() {
	type -t "$1" >/dev/null 2>&1
}
