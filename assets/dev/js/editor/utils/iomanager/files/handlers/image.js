import FileHandler from '../file-handler';

export default class Image extends FileHandler {
	/**
	 * @inheritDoc
	 */
	async apply() {
	}

	/**
	 * @inheritDoc
	 */
	static get mimeTypes() {
		return [ 'image/*' ];
	}
}
