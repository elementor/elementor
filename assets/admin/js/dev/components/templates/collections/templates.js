var ElementorTemplatesTemplateModel = require( 'elementor-templates/models/template' ),
	ElementorTemplatesCollection;

ElementorTemplatesCollection = Backbone.Collection.extend( {
	model: ElementorTemplatesTemplateModel
} );

module.exports = ElementorTemplatesCollection;
