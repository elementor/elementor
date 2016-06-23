var TemplatesTemplateModel = require( 'elementor-templates/models/template' ),
	TemplatesCollection;

TemplatesCollection = Backbone.Collection.extend( {
	model: TemplatesTemplateModel
} );

module.exports = TemplatesCollection;
