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
		const	container = elementor.documents.getCurrent().container,
			options = {
				container,
				model: container.model,
				controls: container.settings.controls,
				name: 'kit',
		};

		this.showChildView( 'header', new PanelHeader( options ) );

		this.showChildView( 'content', new PanelContent( options ) );

		this.showChildView( 'footer', new PanelFooter( options ) );
	},
} );
