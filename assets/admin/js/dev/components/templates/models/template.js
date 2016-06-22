var TemplatesTemplateModel;

TemplatesTemplateModel = Backbone.Model.extend( {
	defaults: {
		name: 'awesome',
		title: '',
		author: '',
		content: '',
		screenshot: '',
		categories: [],
		keywords: []
	}
} );

module.exports = TemplatesTemplateModel;
