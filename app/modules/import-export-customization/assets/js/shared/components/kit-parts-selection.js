import { useState, Fragment } from 'react';
import { Box, Typography, Stack, Checkbox, FormControlLabel, Button } from '@elementor/ui';
import PropTypes from 'prop-types';
import kitContentData from '../kit-content-data';

export default function KitPartsSelection( { data, onCheckboxChange, testId, handleSaveCustomization } ) {
	const [ activeDialog, setActiveDialog ] = useState( null );

	return (
		<Stack spacing={ 2 } data-testid={ testId }>
			{ kitContentData.map( ( item ) => (
				<Fragment key={ item.type }>
					<Box key={ item.type } sx={ { mb: 3, border: 1, borderRadius: 1, borderColor: 'action.focus', p: 2.5 } }>
						<Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } }>
							<Box sx={ { flex: 1 } }>
								<FormControlLabel
									control={
										<Checkbox
											color="info"
											checked={ data.includes.includes( item.type ) }
											onChange={ () => onCheckboxChange( item.type ) }
											sx={ { py: 0 } }
											data-testid={ `KitContentDataSelection-${ item.type }` }
											data-type={ item.type }
										/>
									}
									label={ <Typography variant="body1" sx={ { fontWeight: 500 } }>{ item.data.title }</Typography> }
								/>
								<Typography variant="body2" color="text.secondary" sx={ { mt: 1, ml: 4 } }>
									{ item.data.features.open.join( ', ' ) }
								</Typography>
							</Box>
							<Button
								color="secondary"
								onClick={ () => setActiveDialog( item.type ) }
								sx={ { alignSelf: 'center' } }
								data-type={ item.type }
							>
								{ __( 'Edit', 'elementor' ) }
							</Button>
						</Box>
					</Box>
					{ item.dialog && (
						<item.dialog
							open={ activeDialog === item.type }
							handleClose={ () => setActiveDialog( null ) }
							data={ data }
							handleSaveChanges={ handleSaveCustomization }
						/>
					) }
				</Fragment>
			) ) }
		</Stack>
	);
}

KitPartsSelection.propTypes = {
	data: PropTypes.object.isRequired,
	onCheckboxChange: PropTypes.func.isRequired,
	handleSaveCustomization: PropTypes.func.isRequired,
	testId: PropTypes.string,
};
