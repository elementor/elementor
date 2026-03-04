import { defineConfig } from 'tsup';

export default defineConfig( {
	entry: [ 'src/index.ts' ],
	clean: true,
	format: [ 'esm', 'cjs' ],
	sourcemap: true,
	dts: true,
	esbuildOptions( options ) {
		options.loader = {
			...options.loader,
			'.lottie': 'file',
		};
	},
} );
