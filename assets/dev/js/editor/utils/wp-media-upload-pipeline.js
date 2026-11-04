const PIPELINE_MIME_TYPES_BY_EXTENSION = {
	json: 'application/json',
	svg: 'image/svg+xml',
};

export function allowPipelineMimeTypes( extensions ) {
	const extras = extensions.reduce( ( allowed, extension ) => {
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

function collectMimeMaps() {
	const maps = [];
	const localized = window._wpMediaUploadPipelineSettings?.allowedMimeTypes;

	if ( isMimeMap( localized ) ) {
		maps.push( localized );
	}

	const storeMap = readStoreMimeMap();

	if ( storeMap && ! maps.includes( storeMap ) ) {
		maps.push( storeMap );
	}

	return maps;
}

function readStoreMimeMap() {
	const store = window.wp?.uploadMedia?.store;

	if ( ! store || ! window.wp?.data?.select ) {
		return undefined;
	}

	try {
		const allowedMimeTypes = window.wp.data.select( store ).getSettings?.()?.allowedMimeTypes;

		return isMimeMap( allowedMimeTypes ) ? allowedMimeTypes : undefined;
	} catch {
		return undefined;
	}
}

function addMissingMimeTypes( map, extras ) {
	return Object.entries( extras ).reduce( ( added, [ key, mimeType ] ) => {
		if ( ! Object.prototype.hasOwnProperty.call( map, key ) ) {
			map[ key ] = mimeType;
			added.push( { map, key } );
		}

		return added;
	}, [] );
}

function isMimeMap( value ) {
	return Boolean( value ) && typeof value === 'object';
}
