module.exports = elementorModules.Module.extend( {

	CACHE_KEY_NOT_FOUND_ERROR: 'Cache key not found',

	tags: {
		Base: require( 'elementor-dynamic-tags/tag' ),
	},

	cache: {},

	cacheRequests: {},

	cacheCallbacks: [],

	addCacheRequest( tag ) {
		const postId = this.getTagRenderPostId( tag );
		const cacheKey = this.createCacheKey( tag );

		if ( ! this.cacheRequests[ postId ] ) {
			this.cacheRequests[ postId ] = {};
		}

		this.cacheRequests[ postId ][ cacheKey ] = true;
	},

	getTagRenderPostId( tag ) {
		return tag.editorRenderPostId ?? elementor.config.document.id;
	},

	createCacheKey( tag ) {
		return this.buildCacheKeyFor(
			tag.getOption( 'name' ),
			tag.model,
			this.getTagRenderPostId( tag ),
		);
	},

	buildCacheKeyFor( tagName, tagSettings, postId ) {
		return btoa( tagName ) + '-' + btoa( encodeURIComponent( JSON.stringify( tagSettings ) ) ) + '-' + postId;
	},

	loadTagDataFromCache( tag ) {
		var cacheKey = this.createCacheKey( tag );

		if ( undefined !== this.cache[ cacheKey ] ) {
			return this.cache[ cacheKey ];
		}

		const postId = this.getTagRenderPostId( tag );

		if ( ! this.cacheRequests[ postId ] || ! this.cacheRequests[ postId ][ cacheKey ] ) {
			this.addCacheRequest( tag );
		}
	},

	loadCacheRequests() {
		var cacheRequests = this.cacheRequests,
			cacheCallbacks = this.cacheCallbacks;

		this.cacheRequests = {};

		this.cacheCallbacks = [];

		var groups = Object.keys( cacheRequests )
			.map( ( postId ) => ( {
				post_id: Number( postId ),
				tags: Object.keys( cacheRequests[ postId ] ).filter( ( cacheKey ) => undefined === this.cache[ cacheKey ] ),
			} ) )
			.filter( ( group ) => group.tags.length > 0 );

		if ( 0 === groups.length ) {
			cacheCallbacks.forEach( ( entry ) => {
				entry.callback();
			} );

			return;
		}

		var ajaxOptions = {
			data: {
				groups,
			},
			success: ( data ) => {
				this.cache = {
					...this.cache,
					...data,
				};

				cacheCallbacks.forEach( ( entry ) => {
					entry.callback();
				} );
			},
		};

		var disableCache = cacheCallbacks.some( ( entry ) => {
			return entry.disableCache;
		} );

		if ( disableCache ) {
			ajaxOptions.unique_id = `render_tags_batch-${ elementorCommon.helpers.getUniqueId() }`;
		}

		elementorCommon.ajax.addRequest( 'render_tags_batch', ajaxOptions );
	},

	prefetchTags( tagsByPostId ) {
		var self = this;

		Object.keys( tagsByPostId ).forEach( ( postId ) => {
			if ( ! self.cacheRequests[ postId ] ) {
				self.cacheRequests[ postId ] = {};
			}

			tagsByPostId[ postId ].forEach( ( cacheKey ) => {
				if ( undefined === self.cache[ cacheKey ] ) {
					self.cacheRequests[ postId ][ cacheKey ] = true;
				}
			} );
		} );

		return new Promise( ( resolve ) => {
			self.cacheCallbacks.push( {
				callback: resolve,
			} );

			self.loadCacheRequestsImmediate();
		} );
	},

	refreshCacheFromServer( callback, options ) {
		this.cacheCallbacks.push( {
			callback,
			disableCache: options?.disableCache,
		} );

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
		this.loadCacheRequestsImmediate = this.loadCacheRequests.bind( this );
		this.loadCacheRequests = _.debounce( this.loadCacheRequestsImmediate, 300 );
	},
} );
