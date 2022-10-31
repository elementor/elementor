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
		key: 'features',
		label: __( 'Features', 'elementor' ),
	},
	{
		key: 'subscription_plans',
		label: __( 'Kits by plan', 'elementor' ),
	},
];

export default class Taxonomy extends BaseModel {
	text = '';
	type = 'tag';

	/**
	 * Create a tag from server response
	 *
	 * @param {Taxonomy} taxonomy
	 */
	static createFromResponse( taxonomy ) {
		return new Taxonomy().init( {
			text: taxonomy.text,
			type: taxonomy.type,
		} );
	}
}
