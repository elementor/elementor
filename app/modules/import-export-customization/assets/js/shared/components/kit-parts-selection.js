import { Box, Typography, Stack, Checkbox, FormControlLabel, Button } from '@elementor/ui';
import PropTypes from 'prop-types';
import kitContentData from '../kit-content-data';

export default function KitPartsSelection( { data, onCheckboxChange, onEditClicked, testId } ) {
	return (
		<Stack spacing={ 2 } data-testid={ testId }>
			{ kitContentData.map( ( item ) => (
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
									/>
								}
								label={ <Typography variant="body1" sx={ { fontWeight: 500 } }>{ item.data.title }</Typography> }
							/>
							<Typography variant="body2" color="text.secondary" sx={ { mt: 1, ml: 4 } }>
								{ item.data.features.open.join( ', ' ) }
							</Typography>
						</Box>
						<Button
							color="info"
							variant="text"
							onClick={ () => {
								if ( onEditClicked ) {
									onEditClicked( item.type );
								}
							} }
							sx={ { alignSelf: 'center' } }
						>
							{ __( 'Edit', 'elementor' ) }
						</Button>
					</Box>
				</Box>
			) ) }
		</Stack>
	);
}

KitPartsSelection.propTypes = {
	data: PropTypes.object.isRequired,
	onCheckboxChange: PropTypes.func.isRequired,
	onEditClicked: PropTypes.func,
	testId: PropTypes.string,
};
