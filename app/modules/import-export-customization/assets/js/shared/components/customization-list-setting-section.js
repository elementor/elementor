import { useState } from 'react';
import {
	Box,
	Typography,
	CircularProgress,
	FormControlLabel,
	Checkbox,
	Grid,
	Button,
	Stack,
} from '@elementor/ui';
import PropTypes from 'prop-types';

const DEFAULT_VISIBLE_ITEMS_COUNT = 16;

export function ListSettingSection( {
	items,
	title,
	loading,
	settings,
	onSettingChange,
	settingKey,
} ) {
	const [ showMore, setShowMore ] = useState( false );

	return (
		<Box key={ settingKey } sx={ { mb: 3, border: 1, borderRadius: 1, borderColor: 'action.focus', p: 2.5 } }>
			<Stack spacing={ 2 } >
				<Typography variant="h6" >
					{ title }
				</Typography>
				<FormControlLabel
					control={
						<Checkbox
							color="info"
							checked={ settings.length === items.length }
							onChange={ ( e, checked ) => {
								if ( checked ) {
									onSettingChange( items.map( ( { value } ) => value ) );
								} else {
									onSettingChange( [] );
								}
							} }
							sx={ { p: 0 } }
						/>
					}
					sx={ { gap: 1 } }
					label={ <Typography variant="subtitle1" sx={ { fontWeight: 500 } }>All { title.toLowerCase() }</Typography> }
				/>
			</Stack>
			{ loading
				? <CircularProgress size={ 30 } />
				: (
					<Box sx={ { mt: 2, flexGrow: 1 } }>
						<Grid container spacing={ 1 } alignItems="center" >
							{ ( showMore ? items : items.slice( 0, DEFAULT_VISIBLE_ITEMS_COUNT ) ).map( ( item ) => {
								return (
									<Grid key={ item.value } item xs={ 3 } sx={ { p: 1, alignItems: 'center' } } >
										<FormControlLabel
											control={
												<Checkbox
													color="info"
													checked={ settings.includes( item.value ) }
													onChange={ ( e, checked ) => {
														if ( checked ) {
															onSettingChange( [ ...settings, item.value ] );
														} else {
															onSettingChange( settings.filter( ( setting ) => setting !== item.value ) );
														}
													} }
													sx={ { py: 0 } }
												/>
											}
											label={ <Typography variant="body1" sx={ { fontWeight: 400 } }>{ item.label }</Typography> }
										/>
									</Grid>
								);
							} ) }
						</Grid>
					</Box>
				)
			}
			{ items.length > DEFAULT_VISIBLE_ITEMS_COUNT && (
				<Button
					variant="text"
					color="info"
					onClick={ () => setShowMore( ! showMore ) }
				>
					{ __( 'Show more', 'elementor' ) }
				</Button>
			) }
		</Box>
	);
}

ListSettingSection.propTypes = {
	title: PropTypes.string.isRequired,
	children: PropTypes.node,
	loading: PropTypes.bool,
	checked: PropTypes.bool,
	settingKey: PropTypes.string,
	onSettingChange: PropTypes.func.isRequired,
	items: PropTypes.arrayOf(
		PropTypes.shape( {
			label: PropTypes.string.isRequired,
			value: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ),
		} ),
	),
	settings: PropTypes.arrayOf( PropTypes.oneOf( [ PropTypes.string, PropTypes.number ] ) ),
};
