import { useContext } from 'react';

import { ExportContext } from '../../../../../../../context/export-context/export-context-provider';

import TextField from 'elementor-app/ui/atoms/text-field';
import Grid from 'elementor-app/ui/grid/grid';
import Text from 'elementor-app/ui/atoms/text';

export default function KitName() {
	const exportContext = useContext( ExportContext );

	return (
		<Grid container direction="column">
			<Text tag="span" variant="xs">{ __( 'Kit name', 'elementor' ) }</Text>
			<TextField
				placeholder={ __( 'Type kit name here...', 'elementor' ) }
				onChange={ ( event ) => {
					exportContext.dispatch( { type: 'SET_KIT_TITLE', payload: event.target.value } );
				} }
			/>
		</Grid>
	);
}
