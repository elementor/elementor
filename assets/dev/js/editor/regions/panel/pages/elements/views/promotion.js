var PanelElementsPromotionView;

PanelElementsPromotionView = Marionette.ItemView.extend( {
	getTemplate() {
		return this.options.emptyResults
			? '#tmpl-elementor-panel-elements-promotion-empty-state'
			: '#tmpl-elementor-panel-elements-promotion-search-footer';
	},

	className() {
		const baseClass = 'elementor-panel-elements-promotion';
		const modifierClass = this.options.emptyResults
			? `${ baseClass }--empty-state`
			: `${ baseClass }--search-footer`;

		return `${ baseClass } ${ modifierClass }`;
	},

	templateHelpers() {
		return {
			searchTerm: this.options.searchTerm || '',
		};
	},

	hasTemplate() {
		return !! jQuery( this.getTemplate() ).length;
	},

	events: {
		'click .elementor-panel-elements-promotion__cta': 'onCtaClick',
	},

	onCtaClick() {
		window.dispatchEvent(
			new CustomEvent( 'elementor/editor/show-angie-promotion-modal', {
				detail: { prompt: `Generate a new widget - ${ this.options.searchTerm || '' }` },
			} ),
		);
	},
} );

module.exports = PanelElementsPromotionView;
