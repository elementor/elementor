import { getVariantsWithoutMeta } from '../utils/get-variants';

/**
 * @typedef {import('elementor/assets/dev/js/editor/container/container')} Container
 */
export class DeleteVariant extends $e.modules.editor.CommandContainerInternalBase {
	validateArgs( args ) {
		this.requireContainer( args );

		this.requireArgumentConstructor( 'styleDefID', String, args );

		this.requireArgumentConstructor( 'meta', Object, args );

		if ( ! ( 'breakpoint' in args.meta && 'state' in args.meta ) ) {
			throw new Error( 'Invalid meta arg' );
		}
	}

	apply( args ) {
		const { container, styleDefID, meta } = args;

		const oldStyles = container.model.get( 'styles' ) || {};
		let style = {};

		if ( ! oldStyles[ styleDefID ] ) {
			throw new Error( 'Style Def not found' );
		}

		style = oldStyles[ styleDefID ];

		style.variants = getVariantsWithoutMeta( style.variants, meta );

		const newStyles = {
			...oldStyles,
			[ style.id ]: style,
		};

		container.model.set( 'styles', newStyles );
	}
}

export default DeleteVariant;
