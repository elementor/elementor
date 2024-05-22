import Component from './e-component';

class Styleguide extends elementorModules.editor.utils.Module {
	onInit() {
		$e.components.register( new Component() );

		this.addHooks();
	}

	getGlobalRoutes() {
		return {
			'global-colors': 'panel/global/global-colors',
			'global-typography': 'panel/global/global-typography',
		};
	}

	addHooks() {
		elementor.hooks.addAction( 'panel/global/tab/before-show', this.show.bind( this ) );
		elementor.hooks.addAction( 'panel/global/tab/before-destroy', this.hide.bind( this ) );
	}

	/**
	 * Function show() triggered before showing a new tab at the Globals panel.
	 *
	 * @param {Object} args
	 */
	show( args ) {
		if ( ! args.id || ! ( args.id in this.getGlobalRoutes() ) ) {
			return;
		}

		$e.run( `preview/styleguide/${ args.id }` );
	}

	/**
	 * Function hide() triggered before hiding a tab at the Globals panel.
	 *
	 * @param {Object} args
	 */
	hide( args ) {
		if ( ! args.id || ! ( args.id in this.getGlobalRoutes() ) ) {
			return;
		}

		const isGlobalsRoute = Object.values( this.getGlobalRoutes() ).some( ( route ) => (
			$e.routes.current.panel === route
		) );

		if ( isGlobalsRoute ) {
			return;
		}

		$e.run( 'preview/styleguide/hide' );
	}
}

new Styleguide();
