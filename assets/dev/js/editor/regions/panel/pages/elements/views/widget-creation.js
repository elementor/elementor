var PanelElementsWidgetCreationView;

const TEMPLATES = {
	EMPTY_STATE: '#tmpl-elementor-panel-elements-widget-creation-empty-state',
	SEARCH_FOOTER: '#tmpl-elementor-panel-elements-widget-creation-search-footer',
};

const prompt = `Create a widget for me.
Goal: [What should this widget help me accomplish?]
Placement: [Where will I see it in the editor/UI?]
How it should work: `;

PanelElementsWidgetCreationView = Marionette.ItemView.extend( {
	getTemplate() {
		return this.options.emptyResults
			? TEMPLATES.EMPTY_STATE
			: TEMPLATES.SEARCH_FOOTER;
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
				detail: { 
					prompt,
					entry_point: 'search_widget',
				},
			} ),
		);
	},
} );

module.exports = PanelElementsWidgetCreationView;
