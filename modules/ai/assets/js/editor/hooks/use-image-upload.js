import { useState } from 'react';
import { uploadImage } from '../api';

const useImageUpload = () => {
	const [ isUploading, setIsUploading ] = useState( false );
	const [ uploadError, setUploadError ] = useState( '' );
	const [ attachmentData, setAttachmentData ] = useState( {} );

	const upload = async ( ...args ) => {
		setUploadError( '' );
		setIsUploading( true );
		uploadImage( ...args )
			.then( ( result ) => setAttachmentData( ( result ) ) )
			.catch( ( err ) => setUploadError( err?.responseText || err ) )
			.finally( () => setIsUploading( false ) );
	};

	const resetUpload = () => {
		setAttachmentData( {} );
		setUploadError( '' );
		setIsUploading( false );
	};

	return {
		attachmentData,
		isUploading,
		uploadError,
		resetUpload,
		upload,
	};
};

export default useImageUpload;
