var PanelElementsWidgetCreationView;

PanelElementsWidgetCreationView = Marionette.ItemView.extend( {
	getTemplate() {
		return this.options.emptyResults
			? '#tmpl-elementor-panel-elements-widget-creation-empty-state'
			: '#tmpl-elementor-panel-elements-widget-creation-search-footer';
	},

	className() {
		const baseClass = 'elementor-panel-elements-widget-creation';
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
		'click .elementor-panel-elements-widget-creation__cta': 'onCtaClick',
	},

	onCtaClick() {
		window.dispatchEvent(
			new CustomEvent( 'elementor/editor/create-widget', {
				detail: { prompt: `Generate a new widget - ${ this.options.searchTerm || '' }` },
			} ),
		);
	},
} );

module.exports = PanelElementsWidgetCreationView;
