import BaseModel from './base-model';

export const tagTypes = [
	{
		key: 'categories',
		label: __( 'Categories', 'elementor' ),
	},
	{
		key: 'tags',
		label: __( 'Tags', 'elementor' ),
	},
	{
		key: 'type',
		label: __( 'Kit Types', 'elementor' ),
	},
	{
		key: 'features',
		label: __( 'Features', 'elementor' ),
	},
];

export default class Tag extends BaseModel {
	text = '';
	type = 'tag';

	/**
	 * Create a tag from server response
	 *
	 * @param tag
	 */
	static createFromResponse( tag ) {
		const instance = new Tag();

		instance.text = tag.text;
		instance.type = tag.type;

		return instance;
	}
}
