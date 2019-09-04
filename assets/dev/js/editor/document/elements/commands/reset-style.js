import Base from './base';

// ResetStyle.
export default class extends Base {
	validateArgs( args ) {
		this.requireContainer( args );
	}

	getHistory( args ) {
		const { containers = [ args.container ] } = args;

		return {
			containers,
			type: 'reset_style',
		};
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( container ) => {
			const controls = container.settings.controls,
				defaultValues = {};

			container.view.allowRender = false;

			// TODO: move to es6.
			jQuery.each( controls, ( controlName, control ) => {
				if ( ! container.view.isStyleTransferControl( control ) ) {
					return;
				}

				defaultValues[ controlName ] = control.default;
			} );

			$e.run( 'document/elements/settings', {
				container,
				settings: defaultValues,
			} );

			container.view.allowRender = true;

			container.view.renderOnChange();
		} );
	}
}
