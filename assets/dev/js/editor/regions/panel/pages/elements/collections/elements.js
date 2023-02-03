var PanelElementsElementModel = require( '../models/element' ),
	PanelElementsElementsCollection;

PanelElementsElementsCollection = Backbone.Collection.extend( {
	model: PanelElementsElementModel, /* ,
	comparator: 'title'*/
} );

module.exports = PanelElementsElementsCollection;
