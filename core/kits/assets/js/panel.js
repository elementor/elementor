import PanelHeader from './panel-header';
import PanelContent from './panel-content';
import PanelFooter from './panel-footer';

module.exports = Marionette.LayoutView.extend( {
	id: 'elementor-kit-panel',

	template: '#tmpl-elementor-kit-panel',

	regions: {
		header: '#elementor-kit__panel-header__wrapper',
		content: '#elementor-kit__panel-content__wrapper',
		footer: '#elementor-kit__panel-footer__wrapper',
	},

	onBeforeShow() {
		this.showChildView( 'header', new PanelHeader( this.options ) );

		this.showChildView( 'content', new PanelContent( this.options ) );

		this.showChildView( 'footer', new PanelFooter( this.options ) );
	},
} );
