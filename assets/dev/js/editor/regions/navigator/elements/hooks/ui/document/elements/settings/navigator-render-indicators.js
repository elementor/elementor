import After from 'elementor-api/modules/hooks/ui/after';

export class NavigatorRenderIndicators extends After {
	getCommand() {
		return 'document/elements/settings';
	}

	getId() {
		return 'navigator-render-indicators--/panel/editor/open';
	}

	getConditions( args ) {
		return 'string' === typeof args.settings._title;
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( container ) => {
			const { view, model } = container.navigator;

			// Prevent empty title. ( consider move to another hook ).
			if ( 0 === args.settings._title.length ) {
				view.ui.title.text( model.getTitle() );
			}

			jQuery.each( elementor.navigator.indicators, ( indicatorName, indicatorSettings ) => {
				if ( Object.keys( container.settings.changed ).filter( ( key ) => indicatorSettings.settingKeys.includes( key ) ).length ) {
					view.renderIndicators();

					return false;
				}
			} );
		} );
	}
}

export default NavigatorRenderIndicators;
