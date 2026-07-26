#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export function runCheckTextDomain() {
	execSync( 'npx grunt --gruntfile scripts/check-textdomain-grunt.cjs default', {
		cwd: process.cwd(),
		stdio: 'inherit',
	} );
}

if ( import.meta.url === pathToFileURL( process.argv[ 1 ] ).href ) {
	runCheckTextDomain();
}
