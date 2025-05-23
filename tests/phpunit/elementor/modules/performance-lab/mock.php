<?php

function webp_uploads_img_tag_update_mime_type( $image_object, $size, $attachment_id ) {
	// Image_object & size are not used in this function (mocked)
	$image_url = wp_get_attachment_url( $attachment_id );
	$image_url = preg_replace( '/\.[^.]+$/', '.webp', $image_url );
	return $image_url;
}
