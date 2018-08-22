module.exports = Marionette.Region.extend( {

	storage: null,

	storageSizeKeys: null,

	constructor: function() {
		Marionette.Region.prototype.constructor.apply( this, arguments );

		var savedStorage = elementor.getStorage( this.getStorageKey() );

		this.storage = savedStorage ? savedStorage : this.getDefaultStorage();

		this.storageSizeKeys = Object.keys( this.storage.size );
	},

	saveStorage: function( key, value ) {
		this.storage[ key ] = value;

		elementor.setStorage( this.getStorageKey(), this.storage );
	},

	saveSize: function() {
		this.saveStorage( 'size', elementor.helpers.getElementInlineStyle( this.$el, this.storageSizeKeys ) );
	}
} );
