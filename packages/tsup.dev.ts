import { defineConfig } from 'tsup';

export default defineConfig( {
	entry: [ 'src/index.ts' ],
	clean: true,
	format: [ 'esm' ],
	sourcemap: true,
	watch: true,
} );
