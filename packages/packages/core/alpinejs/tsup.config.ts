import { defineConfig } from 'tsup';

export default defineConfig( {
	entry: [ 'src/init.ts' ],
	clean: true,
	format: [ 'esm', 'cjs' ],
	sourcemap: true,
	dts: true,
	noExternal: [ /^alpinejs\// ],
} );
