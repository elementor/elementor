import After from 'elementor-api/modules/hooks/ui/after';

export class ReRenderFloatingBar extends After {
	getCommand() {
		return 'document/elements/settings';
	}

	getId() {
		return 're-render-floating-bar--document/elements/settings';
	}

	getConditions( args ) {
		const floatingBarConfig = args.container.view?.getFloatingBarConfig();

		if ( ! Object.keys( floatingBarConfig ).length ) {
			return false;
		}

		const settings = this.extractSettings( floatingBarConfig );

		return Object.keys( args.settings ).some( ( setting ) => {
			return settings.includes( setting );
		} );
	}

	apply( args ) {
		if ( ! args.container.view ) {
			return;
		}

		const newSettings = {};

		Object.keys( args.settings ).forEach( ( setting ) => {
			newSettings[ setting ] = args.container.settings.get( setting );
		} );

		args.container.view.setFloatingBarActiveSettings( ( prev ) => {
			return {
				...prev,
				...newSettings,
			};
		} );
	}

	/**
	 * Extract a flat array of setting keys from a floating bar config.
	 *
	 * @param {Object} floatingBarConfig - Floating Bar config from the view.
	 *
	 * @return {string[]} - Flat array of settings.
	 */
	extractSettings( floatingBarConfig ) {
		return Object.values( floatingBarConfig.groups || [] ).flatMap( ( group ) => {
			return Object.keys( group.settings );
		} );
	}
}

export default ReRenderFloatingBar;
