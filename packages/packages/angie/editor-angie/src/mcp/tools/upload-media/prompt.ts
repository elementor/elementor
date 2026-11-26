import { toolPrompts } from '@elementor/editor-mcp';

export const uploadMediaToolPrompt = toolPrompts( 'upload-media' );

uploadMediaToolPrompt.description(
	'Imports one image, or up to 5 images, into the WordPress Media Library from public HTTPS URLs and returns the attachment `attachment_id` and `url`. ' +
		'Use the returned `{ id, url }` for any media control (image widget, site logo, favicon). Requires an administrator.'
);

uploadMediaToolPrompt.instruction(
	'Pass `consent: true` only after the user approved importing the image. Never download or base64-encode the image yourself.'
);

uploadMediaToolPrompt.instruction(
	'Only HTTPS URLs are accepted. If the request fails with a permission error, tell the user that only administrators can upload media.'
);
