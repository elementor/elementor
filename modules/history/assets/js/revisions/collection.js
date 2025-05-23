var RevisionModel = require( './model' );

module.exports = Backbone.Collection.extend( {
	model: RevisionModel,
	comparator( model ) {
		return -model.get( 'timestamp' );
	},
} );
