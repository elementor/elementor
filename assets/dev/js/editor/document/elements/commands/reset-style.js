import Base from './base';

// Reset style.
export default class extends Base {
	apply() {
		const { args } = this;

		if ( ! args.element && ! args.elements ) {
			throw Error( 'element or elements are required.' );
		}

		if ( args.element && args.elements ) {
			throw Error( 'element and elements cannot go together please select one of them.' );
		}

		if ( args.element ) {
			args.elements = [ args.element ];
		}

		args.elements.forEach( ( element ) => {
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
