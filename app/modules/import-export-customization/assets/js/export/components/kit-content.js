import { useState } from 'react';
import { Box, Typography, Stack, Checkbox, FormControlLabel, Button } from '@elementor/ui';

import kitContentData from '../../shared/kit-content-data';
import { useExportContext } from '../context/export-context';

export default function KitContent() {
	const { data, dispatch } = useExportContext();
	const [ activeDialog, setActiveDialog ] = useState( null );

	const handleCheckboxChange = ( itemType ) => {
		const isChecked = data.includes.includes( itemType );
		const actionType = isChecked ? 'REMOVE_INCLUDE' : 'ADD_INCLUDE';
		dispatch( { type: actionType, payload: itemType } );
	};

	return (
		<Stack spacing={ 2 }>
			{ kitContentData.map( ( item ) => (
				<>
					<Box key={ item.type } sx={ { mb: 3, border: 1, borderRadius: 1, borderColor: 'action.focus', p: 2.5 } }>
						<Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } }>
							<Box sx={ { flex: 1 } }>
								<FormControlLabel
									control={
										<Checkbox
											data-type={ item.type }
											checked={ data.includes.includes( item.type ) }
											onChange={ () => handleCheckboxChange( item.type ) }
											sx={ { py: 0 } }
										/>
									}
									label={ <Typography variant="body1" sx={ { fontWeight: 500 } }>{ item.data.title }</Typography> }
								/>
								<Typography variant="body2" color="text.secondary" sx={ { mt: 1, ml: 4 } }>
									{ item.data.features.open.join( ', ' ) }
								</Typography>
							</Box>
							<Button onClick={ item.dialog && ( () => setActiveDialog( item.type ) ) } data-type={ item.type } color="secondary" sx={ { alignSelf: 'center' } }>
								{ __( 'Edit', 'elementor' ) }
							</Button>
						</Box>
					</Box>
					{ item.dialog && <item.dialog open={ activeDialog === item.type } handleClose={ () => setActiveDialog( null ) } /> }
				</>
			) ) }
		</Stack>
	);
}
