import { useContext } from 'react';

import { ExportContext } from '../../../../../../../context/export-context/export-context-provider';

import TextField from 'elementor-app/ui/atoms/text-field';
import Grid from 'elementor-app/ui/grid/grid';
import Text from 'elementor-app/ui/atoms/text';

export default function KitDescription() {
	const exportContext = useContext( ExportContext );

	return (
		<Grid container direction="column">
			<Text tag="span" variant="xs">{ __( 'Description (Optional)', 'elementor' ) }</Text>
			<TextField
				placeholder={ __( 'Type description here...', 'elementor' ) }
				onChange={ ( event ) => {
					exportContext.dispatch( { type: 'SET_KIT_DESCRIPTION', payload: event.target.value } );
				} }
			/>
		</Grid>
	);
}
