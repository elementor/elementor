import FileReader from '../file-reader';

export class Video extends FileReader {
	/**
	 * @inheritDoc
	 */
	static getName() {
		return 'video';
	}

	/**
	 * @inheritDoc
	 */
	static get mimeTypes() {
		return [ 'video\\/\\w+' ];
	}
}
