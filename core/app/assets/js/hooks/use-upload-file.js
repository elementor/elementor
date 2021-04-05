import { useState, useEffect } from 'react';

export default function useUploadFile( fileName, action, data ) {
	const [ uploadFile, setUploadFile ] = useState(),
		uploadInitialState = {
			status: 'initial',
			isComplete: false,
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
				success: ( response ) => {
					const status = response.success ? 'success' : 'error';

					setUploadFileStatus( ( prevState ) => ( { ...prevState, status } ) );
				},
				error: () => {
					setUploadFileStatus( ( prevState ) => ( { ...prevState, status: 'error' } ) );
				},
				complete: () => {
					setUploadFileStatus( ( prevState ) => ( { ...prevState, isComplete: true } ) );
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
