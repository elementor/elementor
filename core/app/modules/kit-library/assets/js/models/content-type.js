import BaseModel from './base-model';

export default class ContentType extends BaseModel {
	id = '';
	label = '';
	documentTypes = [];
	documents = [];
	order = 0;

	static createFromResponse( documentType ) {
		const instance = new ContentType();

		instance.id = documentType.id;
		instance.label = documentType.label;
		instance.documentTypes = documentType.doc_types;
		instance.order = documentType.order;
		instance.documents = [];

		return instance;
	}
}
