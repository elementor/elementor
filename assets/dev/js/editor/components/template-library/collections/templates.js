var TemplateLibraryTemplateModel = require( 'elementor-templates/models/template' ),
	TemplateLibraryCollection;

TemplateLibraryCollection = Backbone.Collection.extend( {
	model: TemplateLibraryTemplateModel,
} );

module.exports = TemplateLibraryCollection;
