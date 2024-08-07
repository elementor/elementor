/**
 * @typedef {import('elementor/assets/dev/js/editor/container/container')} Container
 */
export class CreateVariant extends $e.modules.editor.CommandContainerInternalBase {
	validateArgs( args ) {
		this.requireContainer( args );

		this.requireArgumentConstructor( 'styleDefID', String, args );

		this.requireArgumentConstructor( 'meta', Object, args );

		if ( ! ( 'breakpoint' in args.meta && 'state' in args.meta ) ) {
			throw new Error( 'Invalid meta arg' );
		}
	}

	variantExists( style, meta ) {
		return style.variants.some( ( variant ) => {
			return variant.meta.breakpoint === meta.breakpoint && variant.meta.state === meta.state;
		} );
	}

	apply( args ) {
		const { container, styleDefID, meta } = args;

		const oldStyles = container.model.get( 'styles' ) || {};

		if ( ! oldStyles[ styleDefID ] ) {
			throw new Error( 'Style Def not found' );
		}

		const style = oldStyles[ styleDefID ];

		if ( this.variantExists( style, meta ) ) {
			throw new Error( 'Style Variant already exits' );
		}

		style.variants.push( {
			meta,
			props: {},
		} );

		const newStyles = {
			...oldStyles,
			[ styleDefID ]: style,
		};

		container.model.set( 'styles', newStyles );
	}
}

export default CreateVariant;
