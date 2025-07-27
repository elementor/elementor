import * as React from 'react';
import { type StyleDefinition } from '@elementor/editor-styles';
import { validateStyleLabel } from '@elementor/editor-styles-repository';
import { MenuListItem } from '@elementor/editor-ui';
import { Divider } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { globalClassesStylesProvider } from '../global-classes-styles-provider';

type OwnProps = {
	successCallback: ( _: string ) => void;
	styleDef: StyleDefinition;
};

export const ConvertLocalClassToGlobalClass = ( props: OwnProps ) => {
	const localStyleData = props.styleDef;

	const handlePromote = () => {
		const classNamePrefix = `local-copy-`;
		let i = 1;
		let isValid = false;
		let newClassName = ``;
		while ( ! isValid ) {
			newClassName = `${ classNamePrefix }${ i }`;
			const validation = validateStyleLabel( newClassName, 'create' );
			isValid = validation.isValid;
			i++;
		}
		const newId = globalClassesStylesProvider.actions.create?.( newClassName, localStyleData.variants );
		if ( newId ) {
			props.successCallback( newId );
		}
	};

	return (
		<>
			<MenuListItem
				onClick={ handlePromote }
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
