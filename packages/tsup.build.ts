import { defineConfig } from 'tsup';

export default defineConfig( {
	entry: [ 'src/index.ts' ],
	clean: true,
	format: [ 'esm', 'cjs' ],
	sourcemap: true,
	dts: {
		entry: [ 'src/index.ts' ],
		resolve: false,
	},
} );
