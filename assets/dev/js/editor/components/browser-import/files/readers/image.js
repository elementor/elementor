import FileReader from '../file-reader';

export class Image extends FileReader {
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
