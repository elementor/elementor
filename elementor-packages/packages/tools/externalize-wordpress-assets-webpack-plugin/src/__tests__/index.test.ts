/**
 * @jest-environment node
 */

import * as fs from 'fs';
import { vol } from 'memfs';
import * as path from 'path';
import { webpack } from 'webpack';

import { ExternalizeWordPressAssetsWebpackPlugin } from '../index';

jest.mock( 'fs', () => jest.requireActual( 'memfs' ) );

describe( '@elementor/externalize-wordpress-assets-webpack-plugin', () => {
	beforeEach( () => {
		const fileContent = `
			import editor from '@elementor/editor';
			import editorPanels from '@elementor/editor-panels';
			import wp from '@wordpress/element';
			import React from 'react';
			import ReactDOM from 'react-dom';
			import other from '@other/package-name';

			editor();
			editorPanels();
			wp();
			React();
			ReactDOM();
			other();
			
			export const test = 'This is test for exporting something';
		`;

		fs.writeFileSync( path.resolve( '/app.js' ), fileContent );
	} );

	afterEach( () => {
		vol.reset();
	} );

	it( 'should externalize Elementor & WordPress assets', ( done ) => {
		// Arrange.
		const compiler = webpack( {
			mode: 'development',
			devtool: false,
			entry: { 'my-app-test': path.resolve( '/app.js' ) },
			context: path.resolve( '/app.js' ),
			optimization: { runtimeChunk: 'single' },
			output: {
				filename: '[name].js',
				path: path.resolve( '/dist' ),
			},
			plugins: [
				new ExternalizeWordPressAssetsWebpackPlugin( {
					global: ( entryName ) => [ 'elementorPackages', entryName ],
					map: [
						{ request: 'react', global: 'React' },
						{ request: 'react-dom', global: 'ReactDOM' },
						{ request: /^@elementor\/(.+)$/, global: [ 'elementorPackages', '$1' ] },
						{ request: /^@wordpress\/(.+)$/, global: [ 'wp', '$1' ] },
						{ request: '@other/package-name', global: 'otherPackageName' },
					],
				} ),
			],
		} );

		// Expect.
		expect.assertions( 4 );

		// Act.
		compiler.run( ( err, stats ) => {
			// Assert.
			expect( err ).toBe( null );
			expect( stats?.hasErrors() ).toBe( false );
			expect( stats?.hasWarnings() ).toBe( false );

			const fileContent = fs.readFileSync( path.resolve( `/dist/my-app-test.js` ), { encoding: 'utf8' } );

			expect( fileContent ).toMatchSnapshot();

			done();
		} );
	} );
} );
