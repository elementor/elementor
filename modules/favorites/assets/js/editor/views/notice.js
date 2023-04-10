
const PanelElementsNoticeView = Marionette.ItemView.extend( {

	template: '#tmpl-elementor-panel-elements-notice',
	id: 'elementor-favorites-empty-notice-wrapper',
	ui: {
		notice: '.elementor-panel-notice',
	},
	notice: {
		message: __( 'For easy access, favorite the widgets you use most often by right clicking > Add to favorites.', 'elementor' ),
		hrefText: __( 'Got It', 'elementor' ),
	},
	events: {
		'click @ui.notice a': 'onNoticeClick',
	},
	onNoticeClick() {
		elementorCommon.storage.set( 'panelElementsNotice', true );
		this.destroy();
	},
	onRender() {
		if ( elementorCommon.storage.get( 'panelElementsNotice' ) ) {
			return;
		}
		this.ui.notice.html( this.notice.message );
		this.ui.notice.append( ' <a href="#">' + this.notice.hrefText + '</a>' );
	},
} );

module.exports = PanelElementsNoticeView;
