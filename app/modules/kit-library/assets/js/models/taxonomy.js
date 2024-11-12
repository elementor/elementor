import BaseModel from './base-model';
import { __ } from '@wordpress/i18n';

export const CATEGORY = 'categories',
	TAG = 'tags',
	FEATURE = 'features',
	SUBSCRIPTION_PLAN = 'subscription_plans';

export const TaxonomyTypes = [
	{
		key: 'categories',
		label: __( 'Categories', 'elementor' ),
		isOpenByDefault: true,
		data: [],
	},
	{
		key: 'tags',
		label: __( 'Tags', 'elementor' ),
		data: [],
	},
	{
		key: 'features',
		label: __( 'Features', 'elementor' ),
		data: [],
	},
	{
		key: SUBSCRIPTION_PLAN,
		label: __( 'Kits by plan', 'elementor' ),
		data: [],
	},
];

export default class Taxonomy extends BaseModel {
	text = '';
	type = 'tag';
	id = null;

	/**
	 * Create a tag from server response
	 *
	 * @param {Taxonomy} taxonomy
	 */
	static createFromResponse( taxonomy ) {
		return new Taxonomy().init( {
			text: taxonomy.text,
			type: taxonomy.type,
			id: taxonomy.id || null,
		} );
	}
}
