module.exports = elementorModules.Module.extend( {

	CACHE_KEY_NOT_FOUND_ERROR: 'Cache key not found',

	tags: {
		Base: require( 'elementor-dynamic-tags/tag' ),
	},

	cache: {},

	batchCache: {},

	cacheRequests: {},

	batchCacheRequests: {},

	cacheCallbacks: [],

	batchCacheCallbacks: [],

	flushCallbacks: [],

	isBatchPostContext( postId ) {
		return Number( postId ) !== Number( elementor.config.document.id );
	},

	getCacheStore( postId ) {
		return this.isBatchPostContext( postId ) ? this.batchCache : this.cache;
	},

	getTagRenderPostId( tag ) {
		return tag.editorRenderPostId ?? elementor.config.document.id;
	},

	createLegacyCacheKey( tag ) {
		return btoa( tag.getOption( 'name' ) ) + '-' + btoa( encodeURIComponent( JSON.stringify( tag.model ) ) );
	},

	createBatchCacheKey( tag ) {
		return this.buildCacheKeyFor(
			tag.getOption( 'name' ),
			tag.model,
			this.getTagRenderPostId( tag ),
		);
	},

	getCacheKeyForTag( tag ) {
		const postId = this.getTagRenderPostId( tag );

		if ( this.isBatchPostContext( postId ) ) {
			return this.createBatchCacheKey( tag );
		}

		return this.createLegacyCacheKey( tag );
	},

	createCacheKey( tag ) {
		return this.getCacheKeyForTag( tag );
	},

	buildCacheKeyFor( tagName, tagSettings, postId ) {
		return btoa( tagName ) + '-' + btoa( encodeURIComponent( JSON.stringify( tagSettings ) ) ) + '-' + postId;
	},

	addCacheRequest( tag ) {
		const postId = this.getTagRenderPostId( tag );
		const cacheKey = this.getCacheKeyForTag( tag );

		if ( this.isBatchPostContext( postId ) ) {
			if ( ! this.batchCacheRequests[ postId ] ) {
				this.batchCacheRequests[ postId ] = {};
			}

			this.batchCacheRequests[ postId ][ cacheKey ] = true;

			return;
		}

		this.cacheRequests[ cacheKey ] = true;
	},

	loadTagDataFromCache( tag ) {
		const postId = this.getTagRenderPostId( tag );
		const cacheKey = this.getCacheKeyForTag( tag );
		const cacheStore = this.getCacheStore( postId );

		if ( undefined !== cacheStore[ cacheKey ] ) {
			return cacheStore[ cacheKey ];
		}

		if ( this.isBatchPostContext( postId ) ) {
			if ( ! this.batchCacheRequests[ postId ] || ! this.batchCacheRequests[ postId ][ cacheKey ] ) {
				this.addCacheRequest( tag );
			}

			return;
		}

		if ( ! this.cacheRequests[ cacheKey ] ) {
			this.addCacheRequest( tag );
		}
	},

	hasPendingLegacyCacheRequests() {
		return Object.keys( this.cacheRequests ).some(
			( cacheKey ) => undefined === this.cache[ cacheKey ],
		);
	},

	hasPendingBatchCacheRequests() {
		return Object.keys( this.batchCacheRequests ).some( ( postId ) => {
			return Object.keys( this.batchCacheRequests[ postId ] ).some(
				( cacheKey ) => undefined === this.batchCache[ cacheKey ],
			);
		} );
	},

	runCacheCallbacks( callbacks ) {
		callbacks.forEach( ( entry ) => {
			entry.callback();
		} );
	},

	loadCacheRequests() {
		var cacheRequests = this.cacheRequests,
			cacheCallbacks = this.cacheCallbacks;

		this.cacheRequests = {};

		this.cacheCallbacks = [];

		var tags = Object.keys( cacheRequests ).filter( ( cacheKey ) => undefined === this.cache[ cacheKey ] );

		if ( 0 === tags.length ) {
			this.runCacheCallbacks( cacheCallbacks );

			return;
		}

		var ajaxOptions = {
			data: {
				post_id: elementor.config.document.id,
				tags,
			},
			success: ( data ) => {
				this.cache = {
					...this.cache,
					...data,
				};

				this.runCacheCallbacks( cacheCallbacks );
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
				tags: Object.keys( batchCacheRequests[ postId ] ).filter(
					( cacheKey ) => undefined === this.batchCache[ cacheKey ],
				),
			} ) )
			.filter( ( group ) => group.tags.length > 0 );

		if ( 0 === groups.length ) {
			this.runCacheCallbacks( batchCacheCallbacks );

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

				this.runCacheCallbacks( batchCacheCallbacks );
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

	flushCacheRequests() {
		const flushCallbacks = this.flushCallbacks;
		const disableCache = flushCallbacks.some( ( entry ) => entry.disableCache );

		this.flushCallbacks = [];

		let pendingPaths = 0;

		const completeFlush = () => {
			pendingPaths--;

			if ( pendingPaths > 0 ) {
				return;
			}

			this.runCacheCallbacks( flushCallbacks );
		};

		if ( this.hasPendingLegacyCacheRequests() ) {
			pendingPaths++;

			this.cacheCallbacks.push( {
				callback: completeFlush,
				disableCache,
			} );

			this.loadCacheRequestsImmediate();
		}

		if ( this.hasPendingBatchCacheRequests() ) {
			pendingPaths++;

			this.batchCacheCallbacks.push( {
				callback: completeFlush,
				disableCache,
			} );

			this.loadBatchCacheRequestsImmediate();
		}

		if ( 0 === pendingPaths ) {
			this.runCacheCallbacks( flushCallbacks );
		}
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
		this.flushCallbacks.push( {
			callback,
			disableCache: options?.disableCache,
		} );

		this.flushCacheRequests();
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
		this.cacheRequests = {};
		this.batchCacheRequests = {};
	},

	onInit() {
		this.loadCacheRequestsImmediate = this.loadCacheRequests.bind( this );
		this.loadCacheRequests = _.debounce( this.loadCacheRequestsImmediate, 300 );

		this.loadBatchCacheRequestsImmediate = this.loadBatchCacheRequests.bind( this );
		this.loadBatchCacheRequests = _.debounce( this.loadBatchCacheRequestsImmediate, 300 );

		this.flushCacheRequestsImmediate = this.flushCacheRequests.bind( this );
		this.flushCacheRequests = _.debounce( this.flushCacheRequestsImmediate, 300 );
	},
} );
