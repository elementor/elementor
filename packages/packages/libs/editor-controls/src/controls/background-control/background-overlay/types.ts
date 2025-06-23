type ImageSrcAttachment = { id: { $$type: 'image-attachment-id'; value: number }; url: null };

type ImageSrcUrl = { url: { $$type: 'url'; value: string }; id: null };

export type BackgroundImageOverlay = {
	$$type: 'background-image-overlay';
	value: {
		image: {
			$$type: 'image';
			value: {
				src: {
					$$type: 'image-src';
					value: ImageSrcAttachment | ImageSrcUrl;
				};
				size: {
					$$type: 'string';
					value: 'thumbnail' | 'medium' | 'large' | 'full';
				};
			};
		};
	};
};
