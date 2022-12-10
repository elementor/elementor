import { useContext } from 'react';

import { ExportContext } from '../../../../../../../context/export-context/export-context-provider';

import TextField from 'elementor-app/ui/atoms/text-field';

export default function KitDescription() {
	const exportContext = useContext( ExportContext );

	return (
		<TextField
			variant="outlined"
			// eslint-disable-next-line @wordpress/i18n-ellipsis
			placeholder={ __( 'Say something about the style and content of these files...', 'elementor' ) }
			multiline
			rows={ 5 }
			onChange={ ( event ) => {
				exportContext.dispatch( { type: 'SET_KIT_DESCRIPTION', payload: event.target.value } );
			} }
		/>
	);
}
