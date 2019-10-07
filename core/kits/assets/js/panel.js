import PanelHeader from './panel-header';
import PanelContent from './panel-content';

module.exports = Marionette.LayoutView.extend( {
	id: 'elementor-kit-panel',

	template: '#tmpl-elementor-kit-panel',

	regions: {
		header: '#elementor-kit__panel-header__wrapper',
		content: '#elementor-kit__panel-content__wrapper',
		footer: '#elementor-kit__panel-footer__wrapper',
	},

	onBeforeShow() {
		this.showChildView( 'header', new PanelHeader() );

		this.showChildView( 'content', new PanelContent( this.options ) );
	},
} );
