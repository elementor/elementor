module.exports = Marionette.CompositeView.extend( {
	templateHelpers: function() {
		return {
			view: this,
		};
	},

	getBehavior: function( name ) {
		return this._behaviors[ Object.keys( this.behaviors() ).indexOf( name ) ];
	},

	initialize: function() {
		this.collection = this.model.get( 'elements' );
	},

	addChildModel: function( model, options ) {
		return this.collection.add( model, options, true );
	},

	addElement( data, options ) {
		if ( this.isCollectionFilled() ) {
			return;
		}

		options = jQuery.extend( {
			trigger: false,
			edit: true,
			onBeforeAdd: null,
			onAfterAdd: null,
		}, options );

		const childTypes = this.getChildType();
		let newItem,
			elType;

		if ( data instanceof Backbone.Model ) {
			newItem = data;

			elType = newItem.get( 'elType' );
		} else {
			newItem = {
				id: elementorCommon.helpers.getUniqueId(),
				elType: childTypes[ 0 ],
				settings: {},
				elements: [],
			};

			if ( data ) {
				jQuery.extend( newItem, data );
			}

			elType = newItem.elType;
		}

		if ( -1 === childTypes.indexOf( elType ) ) {
			return this.children.last().addElement( newItem, options );
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

		if ( options.edit && elementor.documents.getCurrent().history.getActive() ) {
			// Ensure container is created. TODO: Open editor via UI hook after `document/elements/create`.
			newView.getContainer();
			newModel.trigger( 'request:edit' );
		}

		return newView;
	},

	addChildElement: function( data, options ) {
		elementorCommon.helpers.softDeprecated( 'addChildElement', '2.8.0', "$e.run( 'document/elements/create' )" );

		if ( Object !== data.constructor ) {
			data = jQuery.extend( {}, data );
		}

		$e.run( 'document/elements/create', {
			container: this.getContainer(),
			model: data,
			options,
		} );
	},

	cloneItem: function( item ) {
		var self = this;

		if ( item instanceof Backbone.Model ) {
			return item.clone();
		}

		item.id = elementorCommon.helpers.getUniqueId();

		item.settings._element_id = '';

		item.elements.forEach( function( childItem, index ) {
			item.elements[ index ] = self.cloneItem( childItem );
		} );

		return item;
	},

	lookup: function() {
		let element = this;

		if ( element.isDisconnected() ) {
			element = $e.components.get( 'document' ).utils.findViewById( element.model.id );
		}

		return element;
	},

	isDisconnected: function() {
		return this.isDestroyed || ! this.el.isConnected;
	},

	isCollectionFilled: function() {
		return false;
	},
} );
