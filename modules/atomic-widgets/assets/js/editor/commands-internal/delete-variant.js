/**
 * @typedef {import('elementor/assets/dev/js/editor/container/container')} Container
 */
export class DeleteVariant extends $e.modules.editor.CommandContainerInternalBase {
	validateArgs( args ) {
		this.requireContainer( args );

		this.requireArgumentConstructor( 'styleDefId', String, args );

		this.requireArgumentConstructor( 'meta', Object, args );

		if ( ! ( 'breakpoint' in args.meta && 'state' in args.meta ) ) {
			throw new Error( 'Invalid meta arg' );
		}
	}

	apply( args ) {
		const { container, styleDefId, meta } = args;

		const oldStyles = container.model.get( 'styles' ) || {};
		let style = {};

		if ( ! oldStyles[ styleDefId ] ) {
			throw new Error( 'Style Def not found' );
		}

		style = oldStyles[ styleDefId ];

		style.variants = style.variants.filter( ( variant ) => {
			return variant.meta.breakpoint !== meta.breakpoint || variant.meta.state !== meta.state;
		} );

		const newStyles = {
			...oldStyles,
			[ style.id ]: style,
		};

		container.model.set( 'styles', newStyles );
	}
}

export default DeleteVariant;
