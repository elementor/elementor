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

	static getFormattedTaxonomyItem( taxonomy ) {
		if ( ! Taxonomy._isTaxonomySubscriptionByPlan( taxonomy ) ) {
			return taxonomy;
		}

		const transformedTaxonomy = new Taxonomy();

		transformedTaxonomy.id = Taxonomy._getFormattedTaxonomyId( Taxonomy._getTaxonomyIdByText( taxonomy.text ) );
		transformedTaxonomy.text = NEW_PLAN_TEXTS[ transformedTaxonomy.id ];
		transformedTaxonomy.type = taxonomy.type;

		return transformedTaxonomy;
	}

	static isKitInTaxonomy( kit, taxonomyType, taxonomies ) {
		return SUBSCRIPTION_PLAN === taxonomyType
			? taxonomies.includes( TIERS_TO_KEYS_MAP[ kit.accessTier ] )
			: taxonomies.some( ( taxonomy ) => kit.taxonomies.includes( taxonomy ) );
	}

	static _isTaxonomySubscriptionByPlan( taxonomy ) {
		return SUBSCRIPTION_PLAN === taxonomy.type && Object.values( OLD_PLAN_TEXTS ).includes( taxonomy.text );
	}

	static _getTaxonomyIdByText( taxonomyText ) {
		return Object.keys( OLD_PLAN_TEXTS ).find( ( id ) => OLD_PLAN_TEXTS[ id ] === taxonomyText );
	}

	static _getFormattedTaxonomyId( taxonomyId ) {
		return TAXONOMY_TRANSFORM_MAP[ taxonomyId ] || taxonomyId;
	}
}
