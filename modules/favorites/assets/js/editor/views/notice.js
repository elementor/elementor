const { unregisterHooks } = require( '../notice' );

const PanelElementsNoticeView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-panel-elements-notice',
	id: 'elementor-panel-notice-wrapper',
	ui: {
		notice: '.elementor-panel-notice',
	},
	notice: {
		message: __( 'For easy access, favorite the widgets you use most often by right clicking > Add to favorites.', 'elementor' ),
		hrefText: __( 'Got It', 'elementor' ),
		classes: 'elementor-panel-alert elementor-panel-alert-info',
	},
	events: {
		'click @ui.notice a': 'onNoticeClick',
	},
	onNoticeClick() {
		this.destroy();
		const introductionKey = 'favorites-notice';

		unregisterHooks();

		elementorCommon.ajax.addRequest( 'introduction_viewed', {
			data: {
				introductionKey,
			},
		} );
	},
	onRender() {
		const element = document.createElement( 'span' );
		element.innerText = this.notice.message;

		const linkElement = document.createElement( 'a' );
		linkElement.href = '#';
		linkElement.innerText = this.notice.hrefText;

		element.append( linkElement );
		this.ui.notice.addClass( this.notice.classes );
		this.ui.notice.append( element );
	},
} );

module.exports = PanelElementsNoticeView;
