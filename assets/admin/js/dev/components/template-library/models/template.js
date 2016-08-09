var TemplateLibraryTemplateModel;

TemplateLibraryTemplateModel = Backbone.Model.extend( {
	defaults: {
		name: '',
		title: '',
		source: '',
		type: '',
		author: '',
		thumbnail: '',
		url: '',
		export_link: '',
		categories: [],
		keywords: []
	}
} );

module.exports = TemplateLibraryTemplateModel;
