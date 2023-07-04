import { useState } from 'react';
import { uploadImage } from '../../../api';

const useImageUpload = () => {
	const [ isUploading, setIsUploading ] = useState( false );
	const [ uploadError, setUploadError ] = useState( '' );
	const [ attachmentData, setAttachmentData ] = useState( {} );

	const upload = ( { image, prompt } ) => {
		return new Promise( ( resolve, reject ) => {
			setUploadError( '' );
			setAttachmentData( {} );
			setIsUploading( true );

			uploadImage( { image, prompt } )
				.then( ( result ) => {
					setAttachmentData( ( result ) );
					resolve( result );
				} )
				.catch( ( err ) => {
					const error = err?.responseText || err;

					setUploadError( error );
					reject( error );
				} )
				.finally( () => setIsUploading( false ) );
		} );
	};

	const resetUpload = () => {
		setUploadError( '' );
		setAttachmentData( {} );
		setIsUploading( false );
	};

	return {
		upload,
		resetUpload,
		isUploading,
		uploadError,
		attachmentData,
	};
};

export default useImageUpload;
