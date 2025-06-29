import { useEditImage } from '../context/edit-image-context';
import useImageUpload from './use-image-upload';
import { useGlobalActions } from '../context/global-actions-context';
import FilesUploadHandler from 'elementor-editor/utils/files-upload-handler';

const normalizeImageData = ( imageToUpload ) => {
	if ( ! imageToUpload?.imageUrl ) {
		return imageToUpload;
	}

	return {
		...imageToUpload,
		image_url: imageToUpload.imageUrl,
		use_gallery_image: true,
	};
};

const useImageActions = () => {
	const { editImage, setEditImage } = useEditImage();
	const { setControlValue, saveAndClose } = useGlobalActions();
	const { attachmentData, isUploading, uploadError, upload: uploadImage, resetUpload } = useImageUpload();

	const ensureSVGUploading = ( imageUrl ) => {
		if ( ! imageUrl ) {
			return true;
		}
		const imageExtension = new URL( imageUrl ).pathname.split( '.' ).pop();
		const isUploadAllowed = window._wpPluploadSettings.defaults.filters.mime_types[ 0 ].extensions.split( ',' ).includes(
			imageExtension,
		) || elementorCommon.config.filesUpload.unfilteredFiles;

		if ( ! isUploadAllowed ) {
			const dialog = FilesUploadHandler.getUnfilteredFilesNotEnabledDialog( () => {} );
			dialog.getElements( 'widget' ).css( 'z-index', '170001' );
			dialog.show();
		}

		return isUploadAllowed;
	};

	const upload = ( imageToUpload, prompt ) => {
		if ( ! ensureSVGUploading( imageToUpload.image_url ) ) {
			return Promise.reject( new Error( 'SVG Uploading is not allowed' ) );
		}

		return uploadImage( {
			image: normalizeImageData( imageToUpload ),
			prompt: prompt || imageToUpload.prompt,
		} );
	};

	const getFinalImage = async ( imageToUpload, prompt ) => {
		const isImageAlreadyUploaded = editImage.url === imageToUpload.url;

		if ( isImageAlreadyUploaded ) {
			// Removing inner image property to avoid duplicated uploads.
			const { image, ...result } = editImage;

			return result;
		}

		const result = await upload( imageToUpload, prompt );

		return result?.image;
	};

	const edit = async ( imageToUpload, prompt ) => {
		const result = await upload( imageToUpload, prompt );

		setEditImage( result.image );
	};

	const use = async ( imageToUpload, prompt ) => {
		const result = await getFinalImage( imageToUpload, prompt );

		setControlValue( result );
		saveAndClose();
	};

	const useMultipleImages = async ( imagesToUpload ) => {
		const results = await Promise.all( imagesToUpload.map( async ( img ) => await ( getFinalImage( img, null ) )
			// eslint-disable-next-line no-unused-vars
			.catch( ( _ ) => null ) ) );

		await Promise.all( results.filter( ( result ) => result )
			.map( async ( result ) => await setControlValue( result ) ) );
	};

	return {
		use,
		edit,
		reset: resetUpload,
		error: uploadError,
		data: attachmentData,
		isLoading: isUploading,
		useMultipleImages,
	};
};

export default useImageActions;
