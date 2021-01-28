import { useState, useEffect } from 'react';

export default function useUploadFile( action ) {
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

			formData.append( file.name, file );

			const options = {
				data: formData,
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

			elementorCommon.ajax.addRequest( action, options );
		}
	}, [ file ] );

	return {
		file,
		setFile,
		uploadStatus,
	};
}
