import BaseModel from './base-model';

export const taxonomyType = [
	{
		key: 'categories',
		label: __( 'Categories', 'elementor' ),
		isOpenByDefault: true,
	},
	{
		key: 'tags',
		label: __( 'Tags', 'elementor' ),
	},
	{
		key: 'types',
		label: __( 'Kit Types', 'elementor' ),
	},
	{
		key: 'features',
		label: __( 'Features', 'elementor' ),
	},
];

export default class Taxonomy extends BaseModel {
	text = '';
	type = 'tag';

	/**
	 * Create a tag from server response
	 *
	 * @param taxonomy
	 */
	static createFromResponse( taxonomy ) {
		const instance = new Taxonomy();

		instance.text = taxonomy.text;
		instance.type = taxonomy.type;

		return instance;
	}
}
