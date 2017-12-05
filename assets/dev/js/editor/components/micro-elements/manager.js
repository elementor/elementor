var Module = require( 'elementor-utils/module' );

module.exports = Module.extend( {
	tags: {
		Base: require( 'elementor-micro-elements/tag' )
	},

	getConfig: function( key ) {
		return this.getItems( elementor.config.microElements, key );
	},

	parseTagsText: function( text, parseCallback ) {
		var self = this;

		return text.replace( /\[elementor-tag[^\]]+]/g, function( tagText ) {
			return self.parseTagText( tagText, parseCallback );
		} );
	},

	parseTagText: function( tagText, parseCallback ) {
		var tagData = this.getTagTextData( tagText );

		if ( ! tagData ) {
			return '';
		}

		return parseCallback( tagData.id, tagData.name, tagData.settings );
	},

	getTagTextData: function( tagText ) {
		var tagIDMatch = tagText.match( /id="(.+?(?="))"/ ),
			tagNameMatch = tagText.match( /name="(.+?(?="))"/ ),
			tagSettingsMatch = tagText.match( /settings="(.+?(?="]))/ );

		if ( ! tagIDMatch || ! tagNameMatch || ! tagSettingsMatch ) {
			return false;
		}

		return {
			id: tagIDMatch[1],
			name: tagNameMatch[1],
			settings: JSON.parse( tagSettingsMatch[1] )
		};
	},

	createTag: function( tagID, tagName, tagSettings ) {
		tagSettings.id  = tagID;

		var TagClass = this.tags[ tagName ] || this.tags.Base,
			model = new Backbone.Model( tagSettings );

		return new TagClass( { name: tagName, model: model } );
	},

	renderTagData: function( tagID, tagName, tagSettings ) {
		var tag = this.createTag( tagID, tagName, tagSettings );

		tag.render();

		return tag.el.outerHTML;
	},

	tagDataToTagText: function( tagID, tagName, tagSettings ) {
		tagSettings = tagSettings ? JSON.stringify( tagSettings ) : '';

		return '[elementor-tag id="' + tagID + '" name="' + tagName + '" settings="' + tagSettings + '"]';
	}
} );
