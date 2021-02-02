import { useState, useEffect } from 'react';

export default function useUploadFile( fileName, action, data ) {
	const [ file, setFile ] = useState(),
		uploadInitialState = {
			success: false,
			error: false,
			complete: false,
		},
		[ uploadStatus, setUploadStatus ] = useState( uploadInitialState );

	useEffect( () => {
		if ( file ) {
			const formData = new FormData();

			formData.append( fileName || file.name, file );

			formData.append( 'action', action );

			formData.append( 'nonce', elementorCommon.config.ajax.nonce );

			formData.append( 'data', JSON.stringify( data ) );

			const options = {
				type: 'post',
				url: elementorCommon.config.ajax.url,
				data: formData,
				cache: false,
				contentType: false,
				processData: false,
				success: () => {
					setUploadStatus( ( prevState ) => ( { ...prevState, success: true } ) );
				},
				error: () => {
					setUploadStatus( ( prevState ) => ( { ...prevState, error: true } ) );
				},
				complete: () => {
					setUploadStatus( ( prevState ) => ( { ...prevState, complete: true } ) );
				},
			};

			jQuery.ajax( options );
		}
	}, [ file ] );

	return {
		file,
		setFile,
		uploadStatus,
	};
}
