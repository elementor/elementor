import FileReader from '../file-reader';

export class Video extends FileReader {
	/**
	 * @inheritDoc
	 */
	static get mimeTypes() {
		return [ 'video/\w+' ];
	}
}
