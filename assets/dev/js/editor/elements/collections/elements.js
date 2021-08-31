var ElementModel = require( 'elementor-elements/models/element' );

import ElementRepeaterModel from 'elementor-elements/models/element-repeater';

var ElementsCollection = Backbone.Collection.extend( {
	add: function( models, options, isCorrectSet ) {
		if ( ( ! options || ! options.silent ) && ! isCorrectSet ) {
			throw 'Call Error: Adding model to element collection is allowed only by the dedicated addChildModel() method.';
		}

		return Backbone.Collection.prototype.add.call( this, models, options );
	},

	model: function( attrs, options ) {
		// TODO: Temp code.
		let ModelClass = Backbone.Model,
			model = ElementModel;

		if ( 'tabs-v2' === attrs.widgetType ) {
			model = ElementRepeaterModel;
		}

		if ( attrs.elType ) {
			ModelClass = elementor.hooks.applyFilters( 'element/model', model, attrs );
		}

		return new ModelClass( attrs, options );
	},

	clone: function() {
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
