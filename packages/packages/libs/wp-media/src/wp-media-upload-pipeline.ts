const PIPELINE_MIME_TYPES_BY_EXTENSION: Record< string, string > = {
	json: 'application/json',
	svg: 'image/svg+xml',
};

type MimeMap = Record< string, string >;

type UploadPipelineWindow = Window & {
	_wpMediaUploadPipelineSettings?: {
		allowedMimeTypes?: MimeMap;
	};
	wp?: {
		data?: {
			select: ( store: object ) => {
				getSettings?: () => {
					allowedMimeTypes?: MimeMap;
				};
			};
		};
		uploadMedia?: {
			store?: object;
		};
	};
};

type AddedMime = {
	key: string;
	map: MimeMap;
};

export function allowPipelineMimeTypes( extensions: string[] ): () => void {
	const extras = extensions.reduce< MimeMap >( ( allowed, extension ) => {
		const mimeType = PIPELINE_MIME_TYPES_BY_EXTENSION[ extension ];

		if ( mimeType ) {
			allowed[ extension ] = mimeType;
		}

		return allowed;
	}, {} );

	const extraKeys = Object.keys( extras );

	if ( ! extraKeys.length ) {
		return () => undefined;
	}

	const added = collectMimeMaps().flatMap( ( map ) => addMissingMimeTypes( map, extras ) );

	return () => {
		added.forEach( ( { map, key } ) => {
			delete map[ key ];
		} );
	};
}

function collectMimeMaps(): MimeMap[] {
	const pipelineWindow = window as UploadPipelineWindow;
	const maps: MimeMap[] = [];
	const localized = pipelineWindow._wpMediaUploadPipelineSettings?.allowedMimeTypes;

	if ( isMimeMap( localized ) ) {
		maps.push( localized );
	}

	const storeMap = readStoreMimeMap( pipelineWindow );

	if ( storeMap && ! maps.includes( storeMap ) ) {
		maps.push( storeMap );
	}

	return maps;
}

function readStoreMimeMap( pipelineWindow: UploadPipelineWindow ): MimeMap | undefined {
	const store = pipelineWindow.wp?.uploadMedia?.store;

	if ( ! store || ! pipelineWindow.wp?.data?.select ) {
		return undefined;
	}

	try {
		const allowedMimeTypes = pipelineWindow.wp.data.select( store ).getSettings?.()?.allowedMimeTypes;

		return isMimeMap( allowedMimeTypes ) ? allowedMimeTypes : undefined;
	} catch {
		return undefined;
	}
}

function addMissingMimeTypes( map: MimeMap, extras: MimeMap ): AddedMime[] {
	return Object.entries( extras ).reduce< AddedMime[] >( ( added, [ key, mimeType ] ) => {
		if ( ! Object.prototype.hasOwnProperty.call( map, key ) ) {
			map[ key ] = mimeType;
			added.push( { map, key } );
		}

		return added;
	}, [] );
}

function isMimeMap( value: unknown ): value is MimeMap {
	return Boolean( value ) && typeof value === 'object';
}
