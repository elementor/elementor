import FileReaderBase from '../file-reader-base';

export class Video extends FileReaderBase {
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
