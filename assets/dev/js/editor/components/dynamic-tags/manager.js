module.exports = elementorModules.Module.extend( {

	CACHE_KEY_NOT_FOUND_ERROR: 'Cache key not found',

	tags: {
		Base: require( 'elementor-dynamic-tags/tag' ),
	},

	cache: {},

	cacheRequests: {},

	cacheCallbacks: [],

	addCacheRequest( tag ) {
		this.cacheRequests[ this.createCacheKey( tag ) ] = true;
	},

	createCacheKey( tag ) {
		return btoa( tag.getOption( 'name' ) ) + '-' + btoa( encodeURIComponent( JSON.stringify( tag.model ) ) );
	},

	loadTagDataFromCache( tag ) {
		var cacheKey = this.createCacheKey( tag );

		if ( undefined !== this.cache[ cacheKey ] ) {
			return this.cache[ cacheKey ];
		}

		if ( ! this.cacheRequests[ cacheKey ] ) {
			this.addCacheRequest( tag );
		}
	},

	loadCacheRequests() {
		var cacheRequests = this.cacheRequests,
			cacheCallbacks = this.cacheCallbacks;

		this.cacheRequests = {};

		this.cacheCallbacks = [];

		elementorCommon.ajax.addRequest( 'render_tags', {
			data: {
				post_id: elementor.config.document.id,
				tags: Object.keys( cacheRequests ),
			},
			success: ( data ) => {
				this.cache = {
					...this.cache,
					...data,
				};

				cacheCallbacks.forEach( function( callback ) {
					callback();
				} );
			},
		} );
	},

	refreshCacheFromServer( callback ) {
		this.cacheCallbacks.push( callback );

		this.loadCacheRequests();
	},

	getConfig( key ) {
		return this.getItems( elementor.config.dynamicTags, key );
	},

	parseTagsText( text, settings, parseCallback ) {
		var self = this;

		if ( 'object' === settings.returnType ) {
			return self.parseTagText( text, settings, parseCallback );
		}

		return text.replace( /\[elementor-tag[^\]]+]/g, function( tagText ) {
			return self.parseTagText( tagText, settings, parseCallback );
		} );
	},

	parseTagText( tagText, settings, parseCallback ) {
		var tagData = this.tagTextToTagData( tagText );

		if ( ! tagData ) {
			if ( 'object' === settings.returnType ) {
				return {};
			}

			return '';
		}

		return parseCallback( tagData.id, tagData.name, tagData.settings );
	},

	tagTextToTagData( tagText ) {
		var tagIDMatch = tagText.match( /id="(.*?(?="))"/ ),
			tagNameMatch = tagText.match( /name="(.*?(?="))"/ ),
			tagSettingsMatch = tagText.match( /settings="(.*?(?="]))/ );

		if ( ! tagIDMatch || ! tagNameMatch || ! tagSettingsMatch ) {
			return false;
		}

		return {
			id: tagIDMatch[ 1 ],
			name: tagNameMatch[ 1 ],
			settings: JSON.parse( decodeURIComponent( tagSettingsMatch[ 1 ] ) ),
		};
	},

	createTag( tagID, tagName, tagSettings ) {
		var tagConfig = this.getConfig( 'tags.' + tagName );

		if ( ! tagConfig ) {
			return;
		}

		var TagClass = this.tags[ tagName ] || this.tags.Base,
			model = new elementorModules.editor.elements.models.BaseSettings( tagSettings, {
				controls: tagConfig.controls,
			} );

		return new TagClass( { id: tagID, name: tagName, model } );
	},

	getTagDataContent( tagID, tagName, tagSettings ) {
		var tag = this.createTag( tagID, tagName, tagSettings );

		if ( ! tag ) {
			return;
		}

		return tag.getContent();
	},

	tagDataToTagText( tagID, tagName, tagSettings ) {
		tagSettings = encodeURIComponent( JSON.stringify( ( tagSettings && tagSettings.toJSON( { remove: [ 'default' ] } ) ) || {} ) );

		return '[elementor-tag id="' + tagID + '" name="' + tagName + '" settings="' + tagSettings + '"]';
	},

	tagContainerToTagText( /** Container*/ container ) {
		return elementor.dynamicTags.tagDataToTagText(
			container.view.getOption( 'id' ),
			container.view.getOption( 'name' ),
			container.view.model,
		);
	},

	cleanCache() {
		this.cache = {};
	},

	onInit() {
		this.loadCacheRequests = _.debounce( this.loadCacheRequests, 300 );
	},
} );
