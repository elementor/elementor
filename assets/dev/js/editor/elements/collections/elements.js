var ElementModel = require( 'elementor-elements/models/element' );

var ElementsCollection = Backbone.Collection.extend( {
	add( models, options, isCorrectSet ) {
		if ( ( ! options || ! options.silent ) && ! isCorrectSet ) {
			throw 'Call Error: Adding model to element collection is allowed only by the dedicated addChildModel() method.';
		}

		return Backbone.Collection.prototype.add.call( this, models, options );
	},

	model( attrs, options ) {
		var ModelClass = Backbone.Model;

		if ( attrs.elType ) {
			ModelClass = elementor.hooks.applyFilters( 'element/model', ElementModel, attrs );
		}

		return new ModelClass( attrs, options );
	},

	clone() {
		var tempCollection = Backbone.Collection.prototype.clone.apply( this, arguments ),
			newCollection = new ElementsCollection();

		tempCollection.forEach( function( model ) {
			newCollection.add( model.clone(), null, true );
		} );

		return newCollection;
	},
} );

ElementsCollection.prototype.sync = ElementsCollection.prototype.fetch = ElementsCollection.prototype.save = _.noop;

module.exports = ElementsCollection;
