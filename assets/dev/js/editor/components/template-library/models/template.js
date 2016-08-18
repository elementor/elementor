var TemplateLibraryTemplateModel;

TemplateLibraryTemplateModel = Backbone.Model.extend( {
	defaults: {
		template_id: 0,
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
