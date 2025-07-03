import { createError } from '@elementor/utils';

export const WpMediaNotAvailableError = createError( {
	code: 'wp_media_not_available',
	message: '`wp.media` is not available, make sure the `media-models` handle is set in the dependencies array',
} );

export const WpPluploadSettingsNotAvailableError = createError( {
	code: 'wp_plupload_settings_not_available',
	message: '`_wpPluploadSettings` is not available, make sure a wp media uploader is open',
} );
