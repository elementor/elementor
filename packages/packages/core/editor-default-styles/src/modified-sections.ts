import { STYLE_SECTIONS } from '@elementor/editor-editing-panel';
import { type StyleDefinition } from '@elementor/editor-styles';
import { hash } from '@elementor/utils';

const CUSTOM_CSS_SECTION = 'custom_css';

export function getModifiedSections( initialStyle?: StyleDefinition, currentStyle?: StyleDefinition ): string[] {
	const sectionByProp = new Map(
		STYLE_SECTIONS.flatMap( ( { name, fields } ) => fields.map( ( field ) => [ field, name.toLowerCase() ] ) )
	);
	const modified = new Set< string >();
	const variantsOf = ( style?: StyleDefinition ) =>
		new Map( ( style?.variants ?? [] ).map( ( variant ) => [ JSON.stringify( variant.meta ), variant ] ) );
	const initialVariants = variantsOf( initialStyle );
	const currentVariants = variantsOf( currentStyle );

	new Set( [ ...initialVariants.keys(), ...currentVariants.keys() ] ).forEach( ( meta ) => {
		const initial = initialVariants.get( meta );
		const current = currentVariants.get( meta );

		new Set( [ ...Object.keys( initial?.props ?? {} ), ...Object.keys( current?.props ?? {} ) ] ).forEach(
			( prop ) => {
				if ( isChanged( initial?.props[ prop ], current?.props[ prop ] ) && sectionByProp.has( prop ) ) {
					modified.add( sectionByProp.get( prop ) as string );
				}
			}
		);

		if ( isChanged( initial?.custom_css, current?.custom_css ) ) {
			modified.add( CUSTOM_CSS_SECTION );
		}
	} );

	return [ ...modified ];
}

function isChanged( initial: unknown, current: unknown ) {
	return hash( { value: initial ?? null } ) !== hash( { value: current ?? null } );
}
