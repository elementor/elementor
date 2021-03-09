import BaseModel from './base-model';

export default class Tag extends BaseModel {
	id = '';
	types = [];
	label = '';

	/**
	 * Create a tag from server response
	 *
	 * @param tag
	 */
	static createFromResponse( tag ) {
		const instance = new Tag();

		instance.id = tag.id;
		instance.types = tag.types;
		instance.label = tag.label;

		return instance;
	}
}
