import * as fs from 'node:fs';

import { defineConfig } from 'tsup';

type PackageJSON = {
	name: string;
	version: string;
};

const packageJson: PackageJSON = JSON.parse( fs.readFileSync( './package.json', 'utf8' ) );

export default defineConfig( {
	entry: [ 'src/index.ts' ],
	clean: true,
	format: [ 'cjs' ],
	env: {
		PACKAGE_NAME: packageJson.name,
		PACKAGE_VERSION: packageJson.version,
	},
} );
