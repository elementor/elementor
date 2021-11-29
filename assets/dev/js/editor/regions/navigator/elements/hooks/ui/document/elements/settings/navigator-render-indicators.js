import Base from '../../../base/base';

export class NavigatorRenderIndicators extends Base {
	getCommand() {
		return 'document/elements/settings';
	}

	getId() {
		return 'navigator-render-indicators';
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( container ) => {
			const view = this.component.elements.getElementView( container.id );

			jQuery.each( this.component.region.indicators, ( indicatorName, indicatorSettings ) => {
				if ( Object.keys( container.settings.changed ).filter( ( key ) => indicatorSettings.settingKeys.includes( key ) ).length ) {
					view.renderIndicators();

					return false;
				}
			} );
		} );
	}
}

export default NavigatorRenderIndicators;
