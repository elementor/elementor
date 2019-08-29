import Base from './base';

// ResetStyle.
export default class extends Base {
	validateArgs( args ) {
		this.requireElements( args );
	}

	getHistory( args ) {
		const { elements = [ args.element ] } = args;

		return {
			elements,
			type: 'reset_style',
		};
	}

	apply( args ) {
		const { elements = [ args.element ] } = args;

		elements.forEach( ( element ) => {
			const editModel = element.getEditModel(),
				controls = editModel.get( 'settings' ).controls,
				defaultValues = {};

			element.allowRender = false;

			// TODO: move to es6.
			jQuery.each( controls, ( controlName, control ) => {
				if ( ! element.isStyleTransferControl( control ) ) {
					return;
				}

				defaultValues[ controlName ] = control.default;
			} );

			$e.run( 'document/elements/settings', {
				element,
				settings: defaultValues,
			} );

			element.allowRender = true;

			element.renderOnChange();
		} );
	}
}
