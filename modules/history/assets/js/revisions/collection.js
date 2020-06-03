var RevisionModel = require( './model' );

module.exports = Backbone.Collection.extend( {
	model: RevisionModel,
	comparator: function( model ) {
		return -model.get( 'timestamp' );
	},
} );
