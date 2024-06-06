export const getImageId = () => {
	const imageId = wp.media?.frames?.edit?.model?.id?.toString();
	if ( imageId ) {
		return imageId;
	}

	// In case the image is not in the current frame, we need to find it from the media library
	return getImageIdByUrl();
};
export const getImageIdByUrl = () => {
	const imageUrl = document.getElementById( 'attachment-details-copy-link' )?.value;
	const images = wp.media.frame?.content?.get()?.collection?.models;
	const image = Array.isArray( images ) && images.find( ( img ) => img.attributes.url === imageUrl );
	return image ? image.attributes.id.toString() : null;
};
