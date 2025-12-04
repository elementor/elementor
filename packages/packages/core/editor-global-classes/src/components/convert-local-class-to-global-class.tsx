import * as React from 'react';
import { type StyleDefinition } from '@elementor/editor-styles';
import { validateStyleLabel } from '@elementor/editor-styles-repository';
import { MenuListItem } from '@elementor/editor-ui';
import { Divider } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { globalClassesStylesProvider } from '../global-classes-styles-provider';
import { trackGlobalClasses } from '../utils/tracking';

type OwnProps = {
	successCallback: ( _: string ) => void;
	styleDef: StyleDefinition | null;
	canConvert: boolean;
};

export const ConvertLocalClassToGlobalClass = ( props: OwnProps ) => {
	const localStyleData = props.styleDef;

	const handleConversion = () => {
		const newClassName = createClassName( `converted-class-` );

		if ( ! localStyleData ) {
			throw new Error( 'Style definition is required for converting local class to global class.' );
		}

		const newId = globalClassesStylesProvider.actions.create?.( newClassName, localStyleData.variants );
		if ( newId ) {
			props.successCallback( newId );
			trackGlobalClasses( {
				classId: newId,
				event: 'classCreated',
				source: 'converted',
				classTitle: newClassName,
			} );
		}
	};

	return (
		<>
			<MenuListItem
				disabled={ ! props.canConvert }
				onClick={ handleConversion }
				dense
				sx={ {
					'&.Mui-focusVisible': {
						border: 'none',
						boxShadow: 'none !important',
						backgroundColor: 'transparent',
					},
				} }
			>
				{ __( 'Convert to global class', 'elementor' ) }
			</MenuListItem>
			<Divider />
		</>
	);
};

function createClassName( prefix: string ): string {
	let i = 1;
	let newClassName = `${ prefix }${ i }`;

	while ( ! validateStyleLabel( newClassName, 'create' ).isValid ) {
		newClassName = `${ prefix }${ ++i }`;
	}

	return newClassName;
}
