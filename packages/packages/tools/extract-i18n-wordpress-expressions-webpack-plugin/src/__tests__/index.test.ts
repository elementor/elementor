/**
 * @jest-environment node
 */

import * as fs from 'fs';
import { vol } from 'memfs';
import * as path from 'path';
import { webpack } from 'webpack';

import { ExtractI18nWordpressExpressionsWebpackPlugin } from '../index';

jest.mock( 'fs', () => jest.requireActual( 'memfs' ) );

describe( '@elementor/extract-i18n-wordpress-expressions-webpack-plugin', () => {
	beforeEach( () => {
		// Entry file.
		fs.mkdirSync( path.resolve( '/app/dist' ), { recursive: true } );
		fs.writeFileSync( path.resolve( '/app/dist/index.js' ), '' );

		fs.mkdirSync( path.resolve( '/app2/dist' ), { recursive: true } );
		fs.writeFileSync( path.resolve( '/app2/dist/index.js' ), '' );

		// Should be in output.
		fs.mkdirSync( path.resolve( '/app/src' ), { recursive: true } );
		fs.mkdirSync( path.resolve( '/app/src/components' ), { recursive: true } );
		fs.mkdirSync( path.resolve( '/app/src/hooks' ), { recursive: true } );

		fs.writeFileSync(
			path.resolve( '/app/src/components/component.js' ),
			`
			export default function Component() {
				return __( "Component", 'elementor' );
			}
		`
		);

		fs.writeFileSync(
			path.resolve( '/app/src/hooks/hook.ts' ),
			`
			export default function useHook() {
				return __('hook','elementor');
			}
		`
		);

		fs.writeFileSync(
			path.resolve( '/app/src/index.js' ),
			`
			export default function Index() {
				__(
					'Some long text with multiple lines in the function call',
					'elementor'
				);

				__( "Unique domain", "some-plugin-slug" );

				// translators: %1$s - special placeholder.
				const withSpecialPlaceHolder = __('special placeholder %1$s','elementor' );

				// translators: %s - regular comment.
				const withComment = __( 'regular comment %s','elementor');

				/* translators: %s - comment block. */
				const withCommentBlock = __('comment block %s', 'elementor');

				console.log(__( 'inside console log', 'elementor' ))

				return [
					_n( 'basic with', 'plural', 2, 'elementor' ),
					_nx( 'another with' , 'plural' , 2 , 'elementor' ),
					_x( 'context', 'elementor' ),
					invalid__( 'invalid', 'elementor' ),
				];
			}
		`
		);

		fs.mkdirSync( path.resolve( '/app2/src' ), { recursive: true } );
		fs.writeFileSync(
			path.resolve( '/app2/src/index.js' ),
			`
			export const test = __( 'from app 2', 'elementor' );
		`
		);

		// Should not be in output.
		const ignoredContent = `
			export default function ShouldIgnoreComponent() {
				return __('should ignore','elementor');
			}
		`;

		fs.mkdirSync( path.resolve( '/app/fake-src' ), { recursive: true } );
		fs.writeFileSync( path.resolve( '/app/fake-src/index.js' ), ignoredContent );

		fs.mkdirSync( path.resolve( '/app/src/__tests__' ), { recursive: true } );
		fs.writeFileSync( path.resolve( '/app/src/__tests__/mock.test.js' ), ignoredContent );

		fs.writeFileSync( path.resolve( '/app/src/not-a-js-file.txt' ), ignoredContent );
	} );

	afterEach( () => {
		vol.reset();
	} );

	it( 'should extract translations from scripts', ( done ) => {
		// Arrange.
		const compiler = webpack( {
			mode: 'development',
			entry: {
				app: path.resolve( '/app/dist/index.js' ),
				app2: path.resolve( '/app2/dist/index.js' ),
			},
			output: {
				filename: '[name]/[name].js',
				path: path.resolve( '/output' ),
			},
			plugins: [
				new ExtractI18nWordpressExpressionsWebpackPlugin( {
					pattern: ( entryPath ) => path.resolve( entryPath, '../../src/**/*.{ts,tsx,js,jsx}' ),
				} ),
			],
		} );

		// Act.
		compiler.run( ( err, stats ) => {
			// Assert.
			expect( err ).toBe( null );
			expect( stats?.hasErrors() ).toBe( false );
			expect( stats?.hasWarnings() ).toBe( false );

			expect(
				fs.readFileSync( path.resolve( `/output/app/app.strings.js` ), { encoding: 'utf8' } )
			).toMatchSnapshot();

			expect(
				fs.readFileSync( path.resolve( `/output/app2/app2.strings.js` ), { encoding: 'utf8' } )
			).toMatchSnapshot();

			done();
		} );
	} );
} );
