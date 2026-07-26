import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';



export function appScssPlugin( { root } ) {
	const importsFile = join( root, 'app/assets/styles/app-imports.scss' );

	return {
		name: 'app-scss',
		enforce: 'pre',
		async resolveId( source, importer ) {
			if ( ! importer || ! source.endsWith( '.scss' ) || source.includes( '.component.scss' ) ) {
				return null;
			}

			const resolved = await this.resolve( source, importer, { skipSelf: true } );

			if ( ! resolved ) {
				return null;
			}

			return `\0scss-stub:${ resolved.id }`;
		},
		load( id ) {
			if ( ! id.startsWith( '\0scss-stub:' ) ) {
				return null;
			}

			const resolvedPath = id.replace( '\0scss-stub:', '' );

			if ( resolvedPath.includes( '/app/' ) && existsSync( importsFile ) ) {
				const resourceRelativePath = relative( dirname( importsFile ), resolvedPath ).replace( /\\/g, '/' );
				const importStatement = `@import "${ resourceRelativePath }";`;
				const importContent = readFileSync( importsFile, 'utf8' );

				if ( ! importContent.includes( importStatement ) ) {
					appendFileSync( importsFile, `${ importStatement }\n`, 'utf8' );
				}
			}

			return 'export default {};';
		},
	};
}

const COMPONENT_SCSS_PREFIX = '\0component-scss:';

export function componentScssPlugin() {
	return {
		name: 'component-scss',
		enforce: 'pre',
		async resolveId( source, importer ) {
			if ( ! source.includes( '.component.scss' ) ) {
				return null;
			}

			const resolved = await this.resolve( source, importer, { skipSelf: true } );

			if ( ! resolved ) {
				return null;
			}

			return `${ COMPONENT_SCSS_PREFIX }${ resolved.id }.js`;
		},
		async load( id ) {
			if ( ! id.startsWith( COMPONENT_SCSS_PREFIX ) ) {
				return null;
			}

			const resolvedPath = id.slice( COMPONENT_SCSS_PREFIX.length ).replace( /\.js$/, '' );
			const sass = await import( 'sass' );
			const source = readFileSync( resolvedPath, 'utf8' );
			const result = sass.compileString( source, {
				style: 'compressed',
				loadPaths: [ dirname( resolvedPath ) ],
			} );

			return `export default ${ JSON.stringify( result.css ) };`;
		},
	};
}
