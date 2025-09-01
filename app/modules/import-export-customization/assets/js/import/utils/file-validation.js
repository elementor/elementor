const getMimeTypeToExtensionMap = () => {
	return {
		'application/zip': [ 'zip' ],
		'application/json': [ 'json' ],
		'application/pdf': [ 'pdf' ],
		'text/plain': [ 'txt' ],
		'image/jpeg': [ 'jpg', 'jpeg' ],
		'image/png': [ 'png' ],
		'image/gif': [ 'gif' ],
		'text/csv': [ 'csv' ],
		'application/xml': [ 'xml' ],
		'text/xml': [ 'xml' ],
	};
};

const getValidExtensions = ( filetypes ) => {
	const mimeToExtMap = getMimeTypeToExtensionMap();
	const validExtensions = [];

	filetypes.forEach( ( mimeType ) => {
		if ( mimeToExtMap[ mimeType ] ) {
			validExtensions.push( ...mimeToExtMap[ mimeType ] );
		}
	} );

	return validExtensions;
};

const isValidFileType = ( fileType, fileName = '', filetypes = [] ) => {
	if ( 0 === filetypes.length ) {
		return true;
	}

	if ( filetypes.includes( fileType ) ) {
		return true;
	}

	const extension = fileName.toLowerCase().split( '.' ).pop();
	const validExtensions = getValidExtensions( filetypes );

	return validExtensions.includes( extension );
};

const getAcceptedFileTypes = ( filetypes ) => {
	const acceptTypes = [ ...filetypes ];
	const validExtensions = getValidExtensions( filetypes );

	validExtensions.forEach( ( ext ) => {
		acceptTypes.push( `.${ ext }` );
	} );

	return acceptTypes.join( ',' );
};

export {
	getMimeTypeToExtensionMap,
	getValidExtensions,
	isValidFileType,
	getAcceptedFileTypes,
};
