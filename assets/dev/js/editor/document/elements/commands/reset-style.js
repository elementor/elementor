export class ResetStyle extends $e.modules.editor.document.CommandHistoryBase {
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
				settingsKeys = [];

			container.view.allowRender = false;

			Object.entries( controls ).forEach( ( [ controlName, control ] ) => {
				if ( ! container.view.isStyleTransferControl( control ) ) {
					return;
				}

				settingsKeys.push( controlName );
			} );

			$e.run( 'document/elements/reset-settings', {
				container,
				settings: settingsKeys,
				options: {
					external: true,
				},
			} );

			container.view.allowRender = true;

			container.render();
		} );
	}
}

export default ResetStyle;
