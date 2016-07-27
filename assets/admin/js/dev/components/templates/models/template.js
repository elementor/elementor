var TemplatesTemplateModel;

TemplatesTemplateModel = Backbone.Model.extend( {
	defaults: {
		name: 'awesome',
		title: '',
		author: '',
		thumbnail: '',
		categories: [],
		keywords: []
	}
} );

module.exports = TemplatesTemplateModel;
