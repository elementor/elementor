var TemplateLibraryTemplateModel;

TemplateLibraryTemplateModel = Backbone.Model.extend( {
	defaults: {
		name: 'awesome',
		title: '',
		author: '',
		thumbnail: '',
		url: '',
		categories: [],
		keywords: []
	}
} );

module.exports = TemplateLibraryTemplateModel;
