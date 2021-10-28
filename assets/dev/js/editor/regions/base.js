import StoragePortion from 'elementor-editor-utils/storage-portion';

module.exports = Marionette.Region.extend( {

	storage: null,

	storageSizeKeys: null,

	constructor: function() {
		Marionette.Region.prototype.constructor.apply( this, arguments );

		this.storage = new StoragePortion( this.getStorageKey(), this.getDefaultStorage() );

		this.storageSizeKeys = Object.keys( this.storage.size );
	},

	saveStorage: function( key, value ) {
		this.storage.set( key, value );
	},

	saveSize: function( size ) {
		if ( ! size ) {
			size = elementor.helpers.getElementInlineStyle( this.$el, this.storageSizeKeys );
		}

		this.saveStorage( 'size', size );
	},
} );
