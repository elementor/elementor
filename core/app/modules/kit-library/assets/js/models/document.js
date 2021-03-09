import BaseModel from './base-model';

export default class Document extends BaseModel {
	id = '';
	title = '';
	documentType = '';
	thumbnailUrl = '';
	preview = '';

	/**
	 * Create a tag from server response
	 *
	 * @param document
	 */
	static createFromResponse( document ) {
		const instance = new Document();

		instance.id = document.id;
		instance.title = document.title;
		instance.documentType = document.doc_type;
		instance.thumbnailUrl = document.thumbnail_url;
		instance.previewUrl = document.preview_url;

		return instance;
	}
}
