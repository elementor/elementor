import type { Props } from '@elementor/editor-props';
import { type Breakpoint, type BreakpointsMap } from '@elementor/editor-responsive';
import { type StyleDefinition, type StyleDefinitionState, type StyleDefinitionType } from '@elementor/editor-styles';

import { type PropsResolver } from './create-props-resolver';
import { UnknownStyleTypeError } from './errors';

export type StyleItem = {
	id: string;
	value: string;
	breakpoint: string;
};

export type StyleRenderer = ReturnType< typeof createStylesRenderer >;

type CreateStyleRendererArgs = {
	resolve: PropsResolver;
	breakpoints: BreakpointsMap;
	selectorPrefix?: string;
};

export type RendererStyleDefinition = StyleDefinition & {
	cssName: string;
};

type StyleRendererArgs = {
	styles: RendererStyleDefinition[];
	signal?: AbortSignal;
};

type PropsToCssArgs = {
	props: Props;
	resolve: PropsResolver;
	signal?: AbortSignal;
};

const SELECTORS_MAP: Record< StyleDefinitionType, string > = {
	class: '.',
};

export function createStylesRenderer( { resolve, breakpoints, selectorPrefix = '' }: CreateStyleRendererArgs ) {
	return async ( { styles, signal }: StyleRendererArgs ): Promise< StyleItem[] > => {
		const stylesCssPromises = styles.map( async ( style ) => {
			const variantCssPromises = Object.values( style.variants ).map( async ( variant ) => {
				const css = await propsToCss( { props: variant.props, resolve, signal } );

				return createStyleWrapper()
					.for( style.cssName, style.type )
					.withPrefix( selectorPrefix )
					.withState( variant.meta.state )
					.withMediaQuery( variant.meta.breakpoint ? breakpoints[ variant.meta.breakpoint ] : null )
					.wrap( css );
			} );

			const variantsCss = await Promise.all( variantCssPromises );

			return {
				id: style.id,
				breakpoint: style?.variants[ 0 ]?.meta?.breakpoint || 'desktop',
				value: variantsCss.join( '' ),
			};
		} );

		return await Promise.all( stylesCssPromises );
	};
}

function createStyleWrapper( value: string = '', wrapper?: ( css: string ) => string ) {
	return {
		for: ( cssName: RendererStyleDefinition[ 'cssName' ], type: RendererStyleDefinition[ 'type' ] ) => {
			const symbol = SELECTORS_MAP[ type ];

			if ( ! symbol ) {
				throw new UnknownStyleTypeError( { context: { type } } );
			}

			return createStyleWrapper( `${ value }${ symbol }${ cssName }`, wrapper );
		},

		withPrefix: ( prefix: string ) =>
			createStyleWrapper( [ prefix, value ].filter( Boolean ).join( ' ' ), wrapper ),

		withState: ( state: StyleDefinitionState ) =>
			createStyleWrapper( state ? `${ value }:${ state }` : value, wrapper ),

		withMediaQuery: ( breakpoint: Breakpoint | null ) => {
			if ( ! breakpoint?.type ) {
				return createStyleWrapper( value, wrapper );
			}

			const size = `${ breakpoint.type }:${ breakpoint.width }px`;

			return createStyleWrapper( value, ( css ) => `@media(${ size }){${ css }}` );
		},

		wrap: ( css: string ) => {
			const res = `${ value }{${ css }}`;

			if ( ! wrapper ) {
				return res;
			}

			return wrapper( res );
		},
	};
}

async function propsToCss( { props, resolve, signal }: PropsToCssArgs ) {
	const transformed = await resolve( { props, signal } );

	return Object.entries( transformed )
		.reduce< string[] >( ( acc, [ propName, propValue ] ) => {
			if ( propValue === null ) {
				return acc;
			}

			acc.push( propName + ':' + propValue + ';' );

			return acc;
		}, [] )
		.join( '' );
}
