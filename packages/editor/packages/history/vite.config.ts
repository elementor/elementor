import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig( {
	plugins: [
		react(),
		dts( {
			insertTypesEntry: true,
		} ),
	],
	build: {
		lib: {
			entry: path.resolve( __dirname, 'src/lib/index.ts' ),
			name: 'History',
			formats: [ 'es', 'umd' ],
			fileName: ( format ) => `history.${ format }.js`,
		},
		rollupOptions: {
			external: [ 'react' ],
			output: {
				globals: {
					react: 'React',
				},
			},
		},
	},
} );
