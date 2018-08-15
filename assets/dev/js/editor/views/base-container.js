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
			return this.children.last().addChildElement( newItem, options );
		}

		if ( options.clone ) {
			newItem = this.cloneItem( newItem );
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

	cloneItem: function( item ) {
		var self = this;

		if ( item instanceof Backbone.Model ) {
			return item.clone();
		}

		item.id = elementor.helpers.getUniqueID();

		item.settings._element_id = '';

		item.elements.forEach( function( childItem, index ) {
			item.elements[ index ] = self.cloneItem( childItem );
		} );

		return item;
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
		var self = this;

		if ( self.isCollectionFilled() ) {
			return;
		}

		var elements = elementor.getStorage( 'transfer' ).elements,
			index = self.collection.indexOf( childView.model );

		elementor.channels.data.trigger( 'element:before:add', elements[0] );

		elements.forEach( function( item ) {
			index++;

			self.addChildElement( item, { at: index, clone: true } );
		} );

		elementor.channels.data.trigger( 'element:after:add', elements[0] );
	}
} );
