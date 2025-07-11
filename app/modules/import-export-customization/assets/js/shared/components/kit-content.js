import { Box, Typography, Stack, Checkbox, FormControlLabel, Link } from '@elementor/ui';
import PropTypes from 'prop-types';
import kitContentData from '../kit-content-data';

export default function KitContent( { data, onCheckboxChange, onEditClicked } ) {
	return (
		<Stack spacing={ 2 }>
			{ kitContentData.map( ( item ) => (
				<Box key={ item.type } sx={ { mb: 3, border: 1, borderRadius: 1, borderColor: 'action.focus', p: 2.5 } }>
					<Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } }>
						<Box sx={ { flex: 1 } }>
							<FormControlLabel
								control={
									<Checkbox
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
						<Link
							onClick={ () => {
								if ( onEditClicked ) {
									onEditClicked( item.type );
								}
							} }
							href="#"
							sx={ { alignSelf: 'center' } }
						>
							{ __( 'Edit', 'elementor' ) }
						</Link>
					</Box>
				</Box>
			) ) }
		</Stack>
	);
}

KitContent.propTypes = {
	data: PropTypes.object.isRequired,
	onCheckboxChange: PropTypes.func.isRequired,
	onEditClicked: PropTypes.func,
};
