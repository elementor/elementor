var ItemModel = require( './item' );

module.exports = Backbone.Collection.extend( {
	model: ItemModel,
} );
