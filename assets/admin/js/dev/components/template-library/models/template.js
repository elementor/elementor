var TemplateLibraryTemplateModel;

TemplateLibraryTemplateModel = Backbone.Model.extend( {
	defaults: {
		name: '',
		title: '',
		author: '',
		thumbnail: '',
		url: '',
		categories: [],
		keywords: []
	}
} );

module.exports = TemplateLibraryTemplateModel;
