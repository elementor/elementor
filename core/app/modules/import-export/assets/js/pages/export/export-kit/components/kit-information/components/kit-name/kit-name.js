import { useContext } from 'react';

import { ExportContext } from '../../../../../../../context/export-context/export-context-provider';

import TextField from 'elementor-app/ui/atoms/text-field';

export default function KitName() {
	const exportContext = useContext( ExportContext );

	return (
		<TextField
			variant="outlined"
			placeholder={ __( 'Elementor Kit', 'elementor' ) }
			onChange={ ( event ) => {
				exportContext.dispatch( { type: 'SET_KIT_TITLE', payload: event.target.value } );
			} }
		/>
	);
}
