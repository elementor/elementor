module.exports = Marionette.CompositeView.extend( {

	templateHelpers: function() {
		return {
			view: this
		};
	},

	getBehavior: function( name ) {
		return this._behaviors[ Object.keys( this.behaviors() ).indexOf( name ) ];
	},

	addChildModel: function( model, options ) {
		return this.collection.add( model, options, true );
	},

	addChildElement: function( data, options ) {
		if ( this.isCollectionFilled() ) {
			return;
		}

		options = jQuery.extend( {
			trigger: false,
			edit: true,
			onBeforeAdd: null,
			onAfterAdd: null
		}, options );

		var childTypes = this.getChildType(),
			newItem,
			elType;

		if ( data instanceof Backbone.Model ) {
			newItem = data;

			elType = newItem.get( 'elType' );
		} else {
			newItem = {
				id: elementor.helpers.getUniqueID(),
				elType: childTypes[0],
				settings: {},
				elements: []
			};

			if ( data ) {
				jQuery.extend( newItem, data );
			}

			elType = newItem.elType;
		}

		if ( -1 === childTypes.indexOf( elType ) ) {
			delete options.at;

			return this.children.last().addChildElement( newItem, options );
		}

		if ( options.trigger ) {
			elementor.channels.data.trigger( options.trigger.beforeAdd, newItem );
		}

		if ( options.onBeforeAdd ) {
			options.onBeforeAdd();
		}

		var newModel = this.addChildModel( newItem, { at: options.at } ),
			newView = this.children.findByModel( newModel );

		if ( options.onAfterAdd ) {
			options.onAfterAdd( newModel, newView );
		}

		if ( options.trigger ) {
			elementor.channels.data.trigger( options.trigger.afterAdd, newItem );
		}

		if ( options.edit ) {
			newView.edit();
		}

		return newView;
	},

	isCollectionFilled: function() {
		return false;
	},

	onChildviewRequestAddNew: function( childView ) {
		this.addChildElement( {}, {
			at: childView.$el.index() + 1,
			trigger: {
				beforeAdd: 'element:before:add',
				afterAdd: 'element:after:add'
			}
		} );
	},

	onChildviewRequestPaste: function( childView ) {
		if ( this.isCollectionFilled() ) {
			return;
		}

		var newModel = elementor.getStorage( 'transport' ).model,
			currentIndex = this.collection.indexOf( childView.model );

		newModel.id = elementor.helpers.getUniqueID();

		this.addChildElement( newModel, {
			at: currentIndex + 1,
			trigger: {
				beforeAdd: 'element:before:add',
				afterAdd: 'element:after:add'
			}
		} );
	}
} );
