export function mockAttachmentData( id: number | null ) {
	const originalUrl = `original-image-url-${ id }`;

	return {
		url: originalUrl,
		height: 0,
		width: 0,
		sizes: {
			thumbnail: { url: `thumbnail-image-url-${ id }`, height: 1, width: 1 },
			medium_large: { url: `medium_large-image-url-${ id }`, height: 2, width: 2 },
			large: { url: `large-image-url-${ id }`, height: 3, width: 3 },
			full: { url: originalUrl, height: 4, width: 4 },
		},
	};
}
