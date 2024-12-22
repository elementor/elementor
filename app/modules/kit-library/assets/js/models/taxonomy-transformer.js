import { TIERS } from 'elementor-utils/tiers';
import { __ } from '@wordpress/i18n';
import Taxonomy, { SUBSCRIPTION_PLAN, TaxonomyTypes } from './taxonomy';

const FREE = 'free',
	ESSENTIAL = 'essential',
	ADVANCED = 'advanced',
	PRO = 'pro',
	EXPERT = 'expert,',
	AGENCY = 'agency';

export const OldPlanTexts = {
	[ FREE ]: __( 'Free', 'elementor' ),
	[ PRO ]: __( 'Pro', 'elementor' ),
	[ ADVANCED ]: __( 'Advanced', 'elementor' ),
	[ EXPERT ]: __( 'Expert', 'elementor' ),
	[ AGENCY ]: __( 'Agency', 'elementor' ),
};

export const NewPlanTexts = {
	[ FREE ]: __( 'Free', 'elementor' ),
	[ ESSENTIAL ]: __( 'Essential', 'elementor' ),
	[ ADVANCED ]: __( 'Advanced & Higher', 'elementor' ),
};

const TaxonomyTransformMap = {
	[ PRO ]: ESSENTIAL,
	[ EXPERT ]: ADVANCED,
	[ AGENCY ]: ADVANCED,
};

export const TierToKeyMap = {
	[ TIERS.free ]: FREE,
	[ TIERS.essential ]: ESSENTIAL,
	[ TIERS[ 'essential-oct2023' ] ]: ADVANCED,
	[ TIERS.expert ]: ADVANCED,
	[ TIERS.agency ]: ADVANCED,
};

export const PromotionChipText = {
	[ FREE ]: __( 'Free', 'elementor' ),
	[ ESSENTIAL ]: __( 'Essential', 'elementor' ),
	[ ADVANCED ]: __( 'Advanced', 'elementor' ),
};

export function getTaxonomyFilterItems( taxonomies ) {
	taxonomies = taxonomies ? [ ...taxonomies ] : [];

	const taxonomyFilterItems = taxonomies.reduce( ( map, taxonomy ) => {
		const formattedTaxonomy = _getFormattedTaxonomyItem( taxonomy ),
			taxonomyType = TaxonomyTypes.find( ( { key } ) => key === formattedTaxonomy.type );

		if ( ! taxonomyType ) {
			return map;
		}

		if ( ! map[ formattedTaxonomy.type ] ) {
			map[ formattedTaxonomy.type ] = { ...taxonomyType };
		}

		const { data } = map[ formattedTaxonomy.type ];

		if ( ! data.find( ( { text } ) => text === formattedTaxonomy.text ) ) {
			map[ formattedTaxonomy.type ].data.push( formattedTaxonomy );
		}

		return map;
	}, {} );

	return TaxonomyTypes.reduce( ( formattedTaxonomies, taxonomyItem ) => {
		if ( taxonomyFilterItems[ taxonomyItem.key ]?.data?.length ) {
			formattedTaxonomies.push( taxonomyFilterItems[ taxonomyItem.key ] );
		}

		return formattedTaxonomies;
	}, [] );
}

export function isKitInTaxonomy( kit, taxonomyType, taxonomies ) {
	return SUBSCRIPTION_PLAN === taxonomyType
		? taxonomies.includes( TierToKeyMap[ kit.accessTier ] )
		: taxonomies.some( ( taxonomy ) => kit.taxonomies.includes( taxonomy ) );
}

function _getFormattedTaxonomyItem( taxonomy ) {
	switch ( taxonomy.type ) {
		case SUBSCRIPTION_PLAN:
			return _getFormattedSubscriptionByPlanTaxonomy( taxonomy );

		default:
			return taxonomy;
	}
}

function _getTaxonomyIdByText( taxonomyText ) {
	return Object.keys( OldPlanTexts ).find( ( id ) => OldPlanTexts[ id ] === taxonomyText );
}

function _getFormattedTaxonomyId( taxonomyId ) {
	return TaxonomyTransformMap[ taxonomyId ] || taxonomyId;
}

function _getFormattedSubscriptionByPlanTaxonomy( taxonomy ) {
	const transformedTaxonomy = new Taxonomy();

	transformedTaxonomy.id = _getFormattedTaxonomyId( _getTaxonomyIdByText( taxonomy.text ) );
	transformedTaxonomy.text = NewPlanTexts[ transformedTaxonomy.id ] || taxonomy.text;
	transformedTaxonomy.type = taxonomy.type;

	return transformedTaxonomy;
}
