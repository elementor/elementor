var BaseSettingsModel = require( 'elementor-elements/models/base-settings' ),
	ColumnSettingsModel = require( 'elementor-elements/models/column-settings' ),
	ElementModel;

ElementModel = Backbone.Model.extend( {
	defaults: {
		id: '',
		elType: '',
		isInner: false,
		settings: {},
		defaultEditSettings: {}
	},

	remoteRender: false,
	_htmlCache: null,
	_jqueryXhr: null,
	renderOnLeave: false,

	initialize: function( options ) {
		var elType = this.get( 'elType' ),
			elements = this.get( 'elements' );

		if ( undefined !== elements ) {
			var ElementsCollection = require( 'elementor-elements/collections/elements' );

			this.set( 'elements', new ElementsCollection( elements ) );
		}

		if ( 'widget' === elType ) {
			this.remoteRender = true;
			this.setHtmlCache( options.htmlCache || '' );
		}

		// No need this variable anymore
		delete options.htmlCache;

		// Make call to remote server as throttle function
		this.renderRemoteServer = _.throttle( this.renderRemoteServer, 1000 );

		this.initSettings();

		this.initEditSettings();

		this.on( {
			destroy: this.onDestroy,
			'editor:close': this.onCloseEditor
		} );
	},

	initSettings: function() {
		var elType = this.get( 'elType' ),
			settings = this.get( 'settings' ),
			settingModels = {
				column: ColumnSettingsModel
			},
			SettingsModel = settingModels[ elType ] || BaseSettingsModel;

		if ( jQuery.isEmptyObject( settings ) ) {
			settings = elementor.helpers.cloneObject( settings );
		}

		if ( 'widget' === elType ) {
			settings.widgetType = this.get( 'widgetType' );
		}

		settings.elType = elType;
		settings.isInner = this.get( 'isInner' );

		settings = new SettingsModel( settings );

		this.set( 'settings', settings );

		elementorFrontend.config.elements.data[ this.cid ] = settings;
	},

	initEditSettings: function() {
		var editSettings = new Backbone.Model( this.get( 'defaultEditSettings' ) );

		this.set( 'editSettings', editSettings );

		elementorFrontend.config.elements.editSettings[ this.cid ] = editSettings;
	},

	onDestroy: function() {
		// Clean the memory for all use instances
		var settings = this.get( 'settings' ),
			elements = this.get( 'elements' );

		if ( undefined !== elements ) {
			_.each( _.clone( elements.models ), function( model ) {
				model.destroy();
			} );
		}

		if ( settings instanceof BaseSettingsModel ) {
			settings.destroy();
		}
	},

	onCloseEditor: function() {
		this.initEditSettings();

		if ( this.renderOnLeave ) {
			this.renderRemoteServer();
		}
	},

	setSetting: function( key, value ) {
		var keyParts = key.split( '.' ),
			isRepeaterKey = 3 === keyParts.length,
			settings = this.get( 'settings' );

		key = keyParts[0];

		if ( isRepeaterKey ) {
			settings = settings.get( key ).models[ keyParts[1] ];

			key = keyParts[2];
		}

		settings.setExternalChange( key, value );
	},

	getSetting: function( key ) {
		var keyParts = key.split( '.' ),
			isRepeaterKey = 3 === keyParts.length,
			settings = this.get( 'settings' );

		key = keyParts[0];

		var value = settings.get( key );

		if ( undefined === value ) {
			return '';
		}

		if ( isRepeaterKey ) {
			value = value.models[ keyParts[1] ].get( keyParts[2] );
		}

		return value;
	},

	setHtmlCache: function( htmlCache ) {
		this._htmlCache = htmlCache;
	},

	getHtmlCache: function() {
		return this._htmlCache;
	},

	getTitle: function() {
		var elementData = elementor.getElementData( this );

		return ( elementData ) ? elementData.title : 'Unknown';
	},

	getIcon: function() {
		var elementData = elementor.getElementData( this );

		return ( elementData ) ? elementData.icon : 'unknown';
	},

	createRemoteRenderRequest: function() {
		var data = this.toJSON();

		return elementor.ajax.send( 'render_widget', {
			data: {
				post_id: elementor.config.post_id,
				data: JSON.stringify( data ),
				_nonce: elementor.config.nonce
			},
			success: this.onRemoteGetHtml.bind( this )
		} );
	},

	renderRemoteServer: function() {
		if ( ! this.remoteRender ) {
			return;
		}

		this.renderOnLeave = false;

		this.trigger( 'before:remote:render' );

		if ( this.isRemoteRequestActive() ) {
			this._jqueryXhr.abort();
		}

		this._jqueryXhr = this.createRemoteRenderRequest();
	},

	isRemoteRequestActive: function() {
		return this._jqueryXhr && 4 !== this._jqueryXhr.readyState;
	},

	onRemoteGetHtml: function( data ) {
		this.setHtmlCache( data.render );
		this.trigger( 'remote:render' );
	},

	clone: function() {
		var newModel = new this.constructor( elementor.helpers.cloneObject( this.attributes ) );

		newModel.set( 'id', elementor.helpers.getUniqueID() );

		newModel.setHtmlCache( this.getHtmlCache() );

		var elements = this.get( 'elements' );

		if ( ! _.isEmpty( elements ) ) {
			newModel.set( 'elements', elements.clone() );
		}

		return newModel;
	},

	toJSON: function( options ) {
		options = _.extend( { copyHtmlCache: false }, options );

		// Call parent's toJSON method
		var data = Backbone.Model.prototype.toJSON.call( this );

		_.each( data, function( attribute, key ) {
			if ( attribute && attribute.toJSON ) {
				data[ key ] = attribute.toJSON( options );
			}
		} );

		if ( options.copyHtmlCache ) {
			data.htmlCache = this.getHtmlCache();
		} else {
			delete data.htmlCache;
		}

		return data;
	}

} );

ElementModel.prototype.sync = ElementModel.prototype.fetch = ElementModel.prototype.save = _.noop;

module.exports = ElementModel;
