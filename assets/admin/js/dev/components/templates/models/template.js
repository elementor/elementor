var TemplatesTemplateModel;

TemplatesTemplateModel = Backbone.Model.extend( {
	defaults: {
		name: 'awesome',
		title: '',
		author: '',
		content: '',
		thumbnail: '',
		categories: [],
		keywords: []
	}
} );

module.exports = TemplatesTemplateModel;
