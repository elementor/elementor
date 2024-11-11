import BaseModel from './base-model';
import { TIERS } from 'elementor-utils/tiers';
import { __ } from '@wordpress/i18n';

export const FREE = 'free',
	ESSENTIAL = 'essential',
	ADVANCED = 'advanced',
	PRO = 'pro',
	EXPERT = 'expert,',
	AGENCY = 'agency';

export const SUBSCRIPTION_PLAN = 'subscription_plans';

export const OLD_PLAN_TEXTS = {
	[ FREE ]: __( 'Free', 'elementor' ),
	[ PRO ]: __( 'Pro', 'elementor' ),
	[ ADVANCED ]: __( 'Advanced', 'elementor' ),
	[ EXPERT ]: __( 'Expert', 'elementor' ),
	[ AGENCY ]: __( 'Agency', 'elementor' ),
};

export const NEW_PLAN_TEXTS = {
	[ FREE ]: __( 'Free', 'elementor' ),
	[ ESSENTIAL ]: __( 'Essential', 'elementor' ),
	[ ADVANCED ]: __( 'Advanced & Higher', 'elementor' ),
};

export const PROMOTION_CHIP_TEXT = {
	[ FREE ]: __( 'Free', 'elementor ' ),
	[ ESSENTIAL ]: __( 'Essential', 'elementor ' ),
	[ ADVANCED ]: __( 'Advanced', 'elementor ' ),
};

export const TIERS_TO_KEYS_MAP = {
	[ TIERS.free ]: FREE,
	[ TIERS.essential ]: ESSENTIAL,
	[ TIERS[ 'essential-oct2023' ] ]: ADVANCED,
	[ TIERS.expert ]: ADVANCED,
	[ TIERS.agency ]: ADVANCED,
};

const TAXONOMY_TRANSFORM_MAP = {
	[ PRO ]: ESSENTIAL,
	[ EXPERT ]: ADVANCED,
	[ AGENCY ]: ADVANCED,
};

export const TAXONOMIES = [
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
		key: SUBSCRIPTION_PLAN,
		label: __( 'Kits by plan', 'elementor' ),
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
