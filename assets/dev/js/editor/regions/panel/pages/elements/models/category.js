var PanelElementsCategory;

PanelElementsCategory = Backbone.Model.extend( {
	defaults: {
		name: '',
		title: '',
		icon: '',
		items: [],
	},
} );

module.exports = PanelElementsCategory;
