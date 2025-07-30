/**
 * @jest-environment node
 */

import * as fs from 'fs';
import { vol } from 'memfs';
import * as path from 'path';
import { webpack } from 'webpack';

import { EntryInitializationWebpackPlugin } from '../index';

jest.mock( 'fs', () => jest.requireActual( 'memfs' ) );

describe( 'EntryInitializationWebpackPlugin', () => {
	beforeEach( () => {
		const packageAContent = `
			export function init() {
				// Init the package.
			}
		`;

		const packageBContent = `
			export function boot() {
				// Init the package.
			}
		`;

		fs.writeFileSync( path.resolve( '/package-a.js' ), packageAContent );
		fs.writeFileSync( path.resolve( '/package-b.js' ), packageBContent );
	} );

	afterEach( () => {
		vol.reset();
	} );

	it( 'should add the initialization script to the entries', ( done ) => {
		// Arrange.
		const compiler = webpack( {
			mode: 'development',
			devtool: false,
			context: path.resolve( '/' ),
			entry: {
				'package-a': path.resolve( '/package-a.js' ),
				'package-b': path.resolve( '/package-b.js' ),
			},
			output: {
				filename: '[name].js',
				path: path.resolve( '/dist' ),
			},
			plugins: [
				new EntryInitializationWebpackPlugin( {
					initializer( { entryName } ) {
						if ( entryName === 'packageA' ) {
							return `init();`;
						}

						if ( entryName === 'packageB' ) {
							return `boot();`;
						}

						return '';
					},
				} ),
			],
		} );

		// Expect.
		expect.assertions( 5 );

		// Act.
		compiler.run( ( err, stats ) => {
			// Assert.
			expect( err ).toBe( null );
			expect( stats?.hasErrors() ).toBe( false );
			expect( stats?.hasWarnings() ).toBe( false );

			const files = [ 'package-a.js', 'package-b.js' ];

			files.forEach( ( fileName ) => {
				const fileContent = fs.readFileSync( path.resolve( `/dist/${ fileName }` ), { encoding: 'utf8' } );

				expect( fileContent ).toMatchSnapshot( fileName );
			} );

			done();
		} );
	} );
} );
