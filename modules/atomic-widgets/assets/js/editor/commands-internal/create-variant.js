/**
 * @typedef {import('elementor/assets/dev/js/editor/container/container')} Container
 */
export class CreateVariant extends $e.modules.editor.CommandContainerInternalBase {
	validateArgs( args ) {
		this.requireContainer( args );

		this.requireArgumentConstructor( 'styleDefId', String, args );

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
		const { container, styleDefId, meta } = args;

		const oldStyles = container.model.get( 'styles' ) || {};

		if ( ! oldStyles[ styleDefId ] ) {
			throw new Error( 'Style Def not found' );
		}

		const style = oldStyles[ styleDefId ];

		if ( this.variantExists( style, meta ) ) {
			throw new Error( 'Style Variant already exits' );
		}

		style.variants.push( {
			meta,
			props: {},
		} );

		const newStyles = {
			...oldStyles,
			[ styleDefId ]: style,
		};

		container.model.set( 'styles', newStyles );
	}
}

export default CreateVariant;
