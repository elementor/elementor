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

			jQuery.each( controls, ( controlName, control ) => {
				if ( ! element.isStyleTransferControl( control ) ) {
					return;
				}

				defaultValues[ controlName ] = control.default;
			} );

			editModel.setSetting( defaultValues );

			elementor.channels.data.trigger( 'element:after:reset:style', editModel );

			element.allowRender = true;

			element.renderOnChange();
		} );
	}
}
