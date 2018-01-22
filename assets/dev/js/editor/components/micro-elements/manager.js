var Module = require( 'elementor-utils/module' ),
	SettingsModel = require( 'elementor-elements/models/base-settings' );

module.exports = Module.extend( {
	tags: {
		Base: require( 'elementor-micro-elements/tag' ),
		UI: require( 'elementor-micro-elements/ui-tag' )
	},

	cache: {},

	cacheRequests: {},

	cacheCallbacks: [],

	addCacheRequest: function( tag ) {
		this.cacheRequests[ this.createCacheKey( tag ) ] = true;
	},

	createCacheKey: function( tag ) {
		return btoa( tag.getOption( 'name' ) ) + '-' + btoa( JSON.stringify( tag.model ) );
	},

	loadTagDataFromCache: function( tag ) {
		var cacheKey = this.createCacheKey( tag );

		if ( undefined !== this.cache[ cacheKey ] ) {
			return this.cache[ cacheKey ];
		}

		if ( ! this.cacheRequests[ cacheKey ] ) {
			this.addCacheRequest( tag );
		}
	},

	loadCacheRequests: function() {
		var cache = this.cache,
			cacheRequests = this.cacheRequests,
			cacheCallbacks = this.cacheCallbacks;

		this.cacheRequests = {};

		this.cacheCallbacks = [];

		elementor.ajax.send( 'render_tags', {
			data: {
				post_id: elementor.config.post_id,
				tags: Object.keys( cacheRequests )
			},
			success: function( data ) {
				jQuery.extend( cache, data );

				cacheCallbacks.forEach( function( callback ) {
					callback();
				} );
			}
		} );
	},

	refreshCacheFromServer: function( callback ) {
		this.cacheCallbacks.push( callback );

		this.loadCacheRequests();
	},

	getConfig: function( key ) {
		return this.getItems( elementor.config.microElements, key );
	},

	parseTagsText: function( text, settings, parseCallback ) {
		var self = this;

		if ( 'object' === settings.returnType ) {
			return self.parseTagText( text, settings, parseCallback );
		}

		return text.replace( /\[elementor-tag[^\]]+]/g, function( tagText ) {
			return self.parseTagText( tagText, settings, parseCallback );
		} );
	},

	parseTagText: function( tagText, settings, parseCallback ) {
		var tagData = this.getTagTextData( tagText );

		if ( ! tagData ) {
			if ( 'object' === settings.returnType ) {
				return {};
			}

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
		var tagConfig = this.getConfig( 'tags.' + tagName ),
			DefaultTagClass = this.tags[ 'plain' === tagConfig.render_type ? 'Base' : 'UI' ],
			TagClass = this.tags[ tagName ] || DefaultTagClass,
			model = new SettingsModel( tagSettings, {
				controls: tagConfig.controls
			} );

		return new TagClass( { id: tagID, name: tagName, model: model } );
	},

	renderTagData: function( tagID, tagName, tagSettings ) {
		return this.createTag( tagID, tagName, tagSettings ).getContent();
	},

	tagDataToTagText: function( tagID, tagName, tagSettings ) {
		tagSettings = tagSettings ? JSON.stringify( tagSettings ) : '';

		return '[elementor-tag id="' + tagID + '" name="' + tagName + '" settings="' + tagSettings + '"]';
	},

	onInit: function() {
		this.loadCacheRequests = _.debounce( this.loadCacheRequests, 300 );
	}
} );
