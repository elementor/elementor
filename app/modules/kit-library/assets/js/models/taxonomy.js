import BaseModel from './base-model';
import { __ } from '@wordpress/i18n';

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

	static taxonomyTransformMap = {
		[ __( 'Free', 'elementor' ) ]: __( 'Free', 'elementor' ),
		[ __( 'Pro', 'elementor' ) ]: __( 'Essential', 'elementor' ),
		[ __( 'Advanced', 'elementor' ) ]: __( 'Advanced & Higher', 'elementor' ),
		[ __( 'Expert', 'elementor' ) ]: __( 'Advanced & Higher', 'elementor' ),
		[ __( 'Agency', 'elementor' ) ]: __( 'Advanced & Higher', 'elementor' ),
	};

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

	static getFormattedTaxonomyItem( taxonomy ) {
		if ( 'subscription_plans' !== taxonomy.type || ! Taxonomy.taxonomyTransformMap[ taxonomy.text ] ) {
			return taxonomy;
		}

		const transformedTaxonomy = new Taxonomy();

		transformedTaxonomy.text = Taxonomy.taxonomyTransformMap[ taxonomy.text ];
		transformedTaxonomy.type = taxonomy.type;

		return transformedTaxonomy;
	}

	static taxonomyFilterTransformer( taxonomy ) {
		return Taxonomy.queryParamSetterTransformer( Taxonomy.taxonomyTransformMap[ taxonomy ] ?? taxonomy );
	}

	static queryParamSetterTransformer( taxonomy ) {
		const taxonomyMap = {
			[ __( 'Advanced & Higher', 'elementor' ) ]: 'Advanced',
			[ __( 'Essential', 'elementor' ) ]: 'Essential',
			[ __( 'Free', 'elementor' ) ]: 'Free',
		};

		return taxonomyMap[ taxonomy ] ?? taxonomy;
	}

	static queryParamGetterTransformer( taxonomy ) {
		const taxonomyMap = {
			Pro: 'Essential',
			Expert: 'Advanced',
			Agency: 'Advanced',
		};

		return taxonomyMap[ taxonomy ] ?? taxonomy;
	}
}
