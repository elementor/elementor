module.exports = Marionette.Region.extend( {

	storage: null,

	storageSizeKeys: null,

	constructor() {
		Marionette.Region.prototype.constructor.apply( this, arguments );

		var savedStorage = elementorCommon.storage.get( this.getStorageKey() );

		this.storage = savedStorage ? savedStorage : this.getDefaultStorage();

		this.storageSizeKeys = Object.keys( this.storage.size );
	},

	saveStorage( key, value ) {
		this.storage[ key ] = value;

		elementorCommon.storage.set( this.getStorageKey(), this.storage );
	},

	saveSize( size ) {
		if ( ! size ) {
			size = elementor.helpers.getElementInlineStyle( this.$el, this.storageSizeKeys );
		}

		this.saveStorage( 'size', size );
	},
} );
