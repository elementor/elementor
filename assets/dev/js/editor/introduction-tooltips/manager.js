import GlobalColorIntroduction from './tooltips/global-color-introduction';
import GlobalFontIntroduction from './tooltips/global-font-introduction';

export default class IntroductionTooltipsManager {
	constructor() {
		this.registerTooltipWidget();
		this.registerTooltips();
	}

	registerTooltipWidget() {
		DialogsManager.addWidgetType( 'tooltip', DialogsManager.getWidgetType( 'buttons' ).extend( 'tooltip', {
			buildWidget() {
				DialogsManager.getWidgetType( 'buttons' ).prototype.buildWidget.apply( this, arguments );

				const elements = this.getElements();
				elements.$title = jQuery( '<div>', { class: 'dialog-tooltip-widget__title' } );

				elements.$closeButton = jQuery( '<i>', { class: 'eicon-close' } );
				elements.$closeButton.on( 'click', () => this.hide() );

				elements.header.append(
					elements.$title,
					elements.$closeButton,
				);
			},
		} ) );
	}

	registerTooltips() {
		const tooltips = [
			new GlobalColorIntroduction( 'globals_introduction' ),
			new GlobalFontIntroduction( 'globals_introduction' ),
		];

		tooltips.forEach( ( tooltip ) => {
			if ( ! elementor.config.user.introduction[ tooltip.introductionKey ] ) {
				tooltip.initTooltip();
				tooltip.bindEvent();
			}
		} );
	}
}
