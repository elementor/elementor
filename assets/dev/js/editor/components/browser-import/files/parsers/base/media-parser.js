import FileParserBase from 'elementor-editor/components/browser-import/files/file-parser-base';

/**
 * @abstract
 */
export class MediaParser extends FileParserBase {
	/**
	 * Upload a media file to the wordpress media library using the `wp/media` command.
	 *
	 * @param {*} file
	 * @param {*} options
	 * @return {{}} result
	 */
	upload( file, options = {} ) {
		return $e.data.run( 'create', 'wp/media', {
			file,
			options: {
				progress: true,
				...options,
			},
		} ).catch( ( result ) => {
			elementor.notifications.showToast( {
				message: result.message,
			} );

			return Promise.reject( result );
		} );
	}
}
