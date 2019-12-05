import History from '../../commands/base/history';

export class ResetStyle extends History {
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

			Object.entries( controls ).forEach( ( [ controlName, control ] ) => {
				if ( ! container.view.isStyleTransferControl( control ) ) {
					return;
				}

				defaultValues[ controlName ] = control.default;
			} );

			// BC: Deprecated since 2.8.0 - use `$e.events`.
			elementor.channels.data.trigger( 'element:before:reset:style', container.model );

			$e.run( 'document/elements/settings', {
				container,
				settings: defaultValues,
			} );

			// BC: Deprecated since 2.8.0 - use `$e.events`.
			elementor.channels.data.trigger( 'element:after:reset:style', container.model );

			container.view.allowRender = true;

			container.render();
		} );
	}
}

export default ResetStyle;
