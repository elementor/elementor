module.exports = Marionette.ItemView.extend( {
	getContent: function() {
		var data = elementor.dynamicTags.loadTagDataFromCache( this );

		if ( undefined === data ) {
			throw new Error();
		}

		return data;
	}
} );
