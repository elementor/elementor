import { useState, useEffect } from 'react';

export default function useUploadFile( fileName, action, data ) {
	const [ uploadFile, setUploadFile ] = useState(),
		uploadInitialState = {
			success: false,
			error: false,
			complete: false,
		},
		[ uploadFileStatus, setUploadFileStatus ] = useState( uploadInitialState );

	useEffect( () => {
		if ( uploadFile ) {
			const formData = new FormData();

			formData.append( fileName || uploadFile.name, uploadFile );

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
					setUploadFileStatus( ( prevState ) => ( { ...prevState, success: true } ) );
				},
				error: () => {
					setUploadFileStatus( ( prevState ) => ( { ...prevState, error: true } ) );
				},
				complete: () => {
					setUploadFileStatus( ( prevState ) => ( { ...prevState, complete: true } ) );
				},
			};

			jQuery.ajax( options );
		}
	}, [ uploadFile ] );

	return {
		uploadFile,
		setUploadFile,
		uploadFileStatus,
	};
}
