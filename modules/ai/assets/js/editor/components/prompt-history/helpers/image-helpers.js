export const getImageThumbnailURL = ( imageURL ) => {
	// FIXME: Use URL from meta once available
	return `https://my.stg.elementor.red/ai/thumb/?o=${ btoa( imageURL, false ) }`;
};
