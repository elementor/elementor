module.exports = elementorModules.Module.extend( {

	CACHE_KEY_NOT_FOUND_ERROR: 'Cache key not found',

	tags: {
		Base: require( 'elementor-dynamic-tags/tag' ),
	},

	cache: {},

	cacheRequests: {},

	cacheCallbacks: [],

	batchCache: {},

	batchCacheRequests: {},

	batchCacheCallbacks: [],

	getTagRenderPostId( tag ) {
		return tag.editorRenderPostId ?? elementor.config.document.id;
	},

	isBatchPostContext( postId ) {
		return Number( postId ) !== Number( elementor.config.document.id );
	},

	createCacheKey( tag ) {
		return btoa( tag.getOption( 'name' ) ) + '-' + btoa( encodeURIComponent( JSON.stringify( tag.model ) ) );
	},

	createBatchCacheKey( tag ) {
		return this.buildCacheKeyFor(
			tag.getOption( 'name' ),
			tag.model,
			this.getTagRenderPostId( tag ),
		);
	},

	buildCacheKeyFor( tagName, tagSettings, postId ) {
		return btoa( tagName ) + '-' + btoa( encodeURIComponent( JSON.stringify( tagSettings ) ) ) + '-' + postId;
	},

	addCacheRequest( tag ) {
		const postId = this.getTagRenderPostId( tag );

		if ( this.isBatchPostContext( postId ) ) {
			const batchCacheKey = this.createBatchCacheKey( tag );

			if ( ! this.batchCacheRequests[ postId ] ) {
				this.batchCacheRequests[ postId ] = {};
			}

			this.batchCacheRequests[ postId ][ batchCacheKey ] = true;
			return;
		}

		this.cacheRequests[ this.createCacheKey( tag ) ] = true;
	},

	loadTagDataFromCache( tag ) {
		const postId = this.getTagRenderPostId( tag );

		if ( this.isBatchPostContext( postId ) ) {
			const batchCacheKey = this.createBatchCacheKey( tag );

			if ( undefined !== this.batchCache[ batchCacheKey ] ) {
				return this.batchCache[ batchCacheKey ];
			}

			if ( ! this.batchCacheRequests[ postId ] || ! this.batchCacheRequests[ postId ][ batchCacheKey ] ) {
				this.addCacheRequest( tag );
			}

			return;
		}

		const cacheKey = this.createCacheKey( tag );

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

		if ( 0 === Object.keys( cacheRequests ).length ) {
			cacheCallbacks.forEach( ( entry ) => {
				entry.callback();
			} );

			return;
		}

		var ajaxOptions = {
			data: {
				post_id: elementor.config.document.id,
				tags: Object.keys( cacheRequests ),
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
			ajaxOptions.unique_id = `render_tags-${ elementorCommon.helpers.getUniqueId() }`;
		}

		elementorCommon.ajax.addRequest( 'render_tags', ajaxOptions );
	},

	loadBatchCacheRequests() {
		var batchCacheRequests = this.batchCacheRequests,
			batchCacheCallbacks = this.batchCacheCallbacks;

		this.batchCacheRequests = {};
		this.batchCacheCallbacks = [];

		var groups = Object.keys( batchCacheRequests )
			.map( ( postId ) => ( {
				post_id: Number( postId ),
				tags: Object.keys( batchCacheRequests[ postId ] ).filter( ( cacheKey ) => undefined === this.batchCache[ cacheKey ] ),
			} ) )
			.filter( ( group ) => group.tags.length > 0 );

		if ( 0 === groups.length ) {
			batchCacheCallbacks.forEach( ( entry ) => {
				entry.callback();
			} );

			return;
		}

		var ajaxOptions = {
			data: {
				groups,
			},
			success: ( data ) => {
				this.batchCache = {
					...this.batchCache,
					...data,
				};

				batchCacheCallbacks.forEach( ( entry ) => {
					entry.callback();
				} );
			},
		};

		var disableCache = batchCacheCallbacks.some( ( entry ) => {
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
			if ( ! self.batchCacheRequests[ postId ] ) {
				self.batchCacheRequests[ postId ] = {};
			}

			tagsByPostId[ postId ].forEach( ( cacheKey ) => {
				if ( undefined === self.batchCache[ cacheKey ] ) {
					self.batchCacheRequests[ postId ][ cacheKey ] = true;
				}
			} );
		} );

		return new Promise( ( resolve ) => {
			self.batchCacheCallbacks.push( {
				callback: resolve,
			} );

			self.loadBatchCacheRequestsImmediate();
		} );
	},

	refreshCacheFromServer( callback, options ) {
		const entry = {
			callback,
			disableCache: options?.disableCache,
		};

		if ( Object.keys( this.batchCacheRequests ).length > 0 ) {
			this.batchCacheCallbacks.push( entry );
			this.loadBatchCacheRequests();
			return;
		}

		this.cacheCallbacks.push( entry );
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
		this.batchCache = {};
	},

	onInit() {
		this.loadCacheRequestsImmediate = this.loadCacheRequests.bind( this );
		this.loadCacheRequests = _.debounce( this.loadCacheRequestsImmediate, 300 );

		this.loadBatchCacheRequestsImmediate = this.loadBatchCacheRequests.bind( this );
		this.loadBatchCacheRequests = _.debounce( this.loadBatchCacheRequestsImmediate, 300 );
	},
} );
