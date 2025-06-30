import { Box, Typography, Stack, Checkbox, FormControlLabel, Link, Card, CardContent } from '@elementor/ui';

import kitContentData from '../../shared/kit-content-data';
import { useExportContext } from '../context/export-context';

export default function KitContent() {
	const { data, dispatch } = useExportContext();

	const handleCheckboxChange = ( itemType ) => {
		const isChecked = data.includes.includes( itemType );
		const actionType = isChecked ? 'REMOVE_INCLUDE' : 'ADD_INCLUDE';
		dispatch( { type: actionType, payload: itemType } );
	};

	return (
		<Stack spacing={ 2 }>
			{ kitContentData.map( ( item ) => (
				<Card key={ item.type } sx={ { mb: 3, border: 1, borderRadius: 1, borderColor: 'action.focus' } } elevation={ 0 } square={ true }>
					<CardContent sx={ { p: 2.5 } }>
						<Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } }>
							<Box sx={ { flex: 1 } }>
								<FormControlLabel
									control={
										<Checkbox
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
							<Link href="#" sx={ { alignSelf: 'center' } }>
								{ __( 'Edit', 'elementor' ) }
							</Link>
						</Box>
					</CardContent>
				</Card>
			) ) }
		</Stack>
	);
}
