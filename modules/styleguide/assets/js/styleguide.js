import Component from './component';

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

	show( args ) {
		if ( ! args.id || ! ( args.id in this.getGlobalRoutes() ) ) {
			return;
		}

		$e.run( `preview/styleguide/${ args.id }` );
	}

	hide( args ) {
		if ( ! args.id || ! ( args.id in this.getGlobalRoutes() ) ) {
			return;
		}

		let isStyleguideCommand = false;

		Object.values( this.getGlobalRoutes() ).forEach( ( route ) => {
			if ( $e.commands.currentTrace.includes( `${ route }/route` ) ) {
				isStyleguideCommand = true;
			}
		} );

		if ( isStyleguideCommand ) {
			return;
		}

		$e.run( 'preview/styleguide/hide' );
	}
}

new Styleguide();
