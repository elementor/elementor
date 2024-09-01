import { getVariantByMeta } from '../utils/get-variants';

/**
 * @typedef {import('elementor/assets/dev/js/editor/container/container')} Container
 */
export class UpdateProps extends $e.modules.editor.CommandContainerInternalBase {
	validateArgs( args ) {
		this.requireContainer( args );

		this.requireArgumentConstructor( 'styleDefID', String, args );

		this.requireArgumentConstructor( 'meta', Object, args );

		this.requireArgumentConstructor( 'props', Object, args );

		if ( ! ( 'breakpoint' in args.meta && 'state' in args.meta ) ) {
			throw new Error( 'Invalid meta arg' );
		}

		if ( 0 === Object.keys( args.props ).length ) {
			throw new Error( 'Props are empty' );
		}
	}

	updateExistingVariant( style, variant, props ) {
		variant.props = {
			...variant.props,
			...props,
		};

		Object.entries( variant.props ).forEach( ( [ key, value ] ) => {
			if ( null === value || undefined === value ) {
				delete variant.props[ key ];
			}
		} );

		return {
			...style,
			variants: style.variants.map( ( v ) =>
				variant.meta.breakpoint === v.breakpoint && variant.meta.state === v.state ? variant : v,
			),
		};
	}

	apply( args ) {
		const { container, styleDefID, meta, props } = args;

		const oldStyles = container.model.get( 'styles' ) || {};
		let style = oldStyles[ styleDefID ];

		if ( ! style ) {
			throw new Error( 'Style Def not found' );
		}

		const variant = getVariantByMeta( style.variants, meta );

		if ( ! variant ) {
			throw new Error( 'Style Variant not found' );
		}

		style = this.updateExistingVariant( style, variant, props );

		const newStyles = {
			...oldStyles,
			[ style.id ]: style,
		};

		container.model.set( 'styles', newStyles );
	}
}

export default UpdateProps;
