import GlobalsIntroduction from './tooltips/globals-introduction';

export default class TooltipsManager {
	tooltips = [];

	constructor() {
		this.addTooltipWidget();
		this.registerTooltips();

		return this.tooltips;
	}

	addTooltipWidget() {
		DialogsManager.addWidgetType( 'tooltip', DialogsManager.getWidgetType( 'buttons' ).extend( 'tooltip', {
			buildWidget() {
				DialogsManager.getWidgetType( 'buttons' ).prototype.buildWidget.apply( this, arguments );

				const elements = this.getElements();
				elements.$title = jQuery( '<div>', { id: 'elementor-element--tooltip__dialog__title' } );

				elements.$closeButton = jQuery( '<i>', { class: 'eicon-close' } );
				elements.$closeButton.on( 'click', () => this.hide() );

				elements.header.append(
					elements.$title,
					elements.$closeButton,
				);
			},
		} ) );
	}

	/**
	 * Function registerElements().
	 *
	 * Register all base elements types.
	 */
	registerTooltips() {
		this.tooltips.push( new GlobalsIntroduction() );
	}
}
