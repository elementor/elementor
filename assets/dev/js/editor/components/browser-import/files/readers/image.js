import FileReaderBase from '../file-reader-base';

export class Image extends FileReaderBase {
	/**
	 * @inheritDoc
	 */
	static getName() {
		return 'image';
	}

	/**
	 * @inheritDoc
	 */
	static get mimeTypes() {
		return [ 'image\\/\\w+' ];
	}
}
