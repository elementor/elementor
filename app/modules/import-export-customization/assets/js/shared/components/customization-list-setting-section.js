import { useState } from 'react';
import { __ } from '@wordpress/i18n';
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
import * as PropTypes from 'prop-types';
import { htmlDecodeTextContent } from 'elementor-app/utils/utils';
const DEFAULT_VISIBLE_ITEMS_COUNT = 16;

export function ListSettingSection( {
	items,
	title,
	loading,
	settings,
	onSettingChange,
	settingKey,
	disabled = false,
} ) {
	const [ showMore, setShowMore ] = useState( false );

	return (
		<Box key={ settingKey } sx={ { mb: 3, border: 1, borderRadius: 1, borderColor: 'action.focus', p: 2.5 } }>
			<Stack spacing={ 2 } >
				<Typography variant="h6" >
					{ title }
				</Typography>
				<Grid container spacing={ 1 } alignItems="start" >
					{ loading
						?
						<Grid item xs={ 12 } sx={ { p: 1, alignItems: 'center', textAlign: 'center' } } >
							<CircularProgress size={ 30 } />
						</Grid>
						:
						<>
						<Grid key={ 'all' } item xs={ 12 } sx={ { py: 1, px: 0 } } >
							<FormControlLabel
								control={
									<Checkbox
										color="info"
										checked={ settings.length === items.length }
										indeterminate={ settings.length > 0 && ( settings.length !== items.length ) }
										onChange={ ( e, checked ) => {
											if ( checked ) {
												onSettingChange( items.map( ( { value } ) => value ), true );
											} else {
												onSettingChange( [], true );
											}
										} }
										disabled={ disabled }
										sx={ { p: 0 } }
									/>
								}
								sx={ { gap: 1 } }
								slotProps={{
									typography: {
										sx: {
											fontWeight: 500,
										},
									},
								}}
								label={`${ __( 'All', 'elementor-pro' ) } ${ title.toLowerCase() }`}
							/>
						</Grid>
						{ ( showMore ? items : items.slice( 0, DEFAULT_VISIBLE_ITEMS_COUNT ) ).map( ( item ) => {
							return (
								<Grid key={ item.value } item xs={ 3 } sx={ { py: 1, px: 0 } } >
									<FormControlLabel
										sx={{ maxWidth: '100%', gap: 1 }}
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
												sx={ { p: 0 } }
												disabled={ disabled }
											/>
										}
										slotProps={{
											typography: {
												sx: {
													maxWidth: '100%',
													overflow: 'hidden',
													textOverflow: 'ellipsis',
													whiteSpace: 'nowrap',
												},
											},
										}}
										label={ htmlDecodeTextContent( item.label ) }
									/>
								</Grid>
							);
						} ) }
						</>
						}
				</Grid>
			</Stack>
			
				{ items.length > DEFAULT_VISIBLE_ITEMS_COUNT && (
					<Button
						variant="text"
						color="info"
						onClick={ () => setShowMore( ! showMore ) }
					>
						{ showMore ? __( 'Show less', 'elementor' ) : __( 'Show more', 'elementor' ) }
					</Button>
				) }
		</Box>
	);
}

ListSettingSection.propTypes = {
	title: PropTypes.string.isRequired,
	children: PropTypes.node,
	loading: PropTypes.bool,
	disabled: PropTypes.bool,
	checked: PropTypes.bool,
	settingKey: PropTypes.string,
	onSettingChange: PropTypes.func.isRequired,
	items: PropTypes.arrayOf(
		PropTypes.shape( {
			label: PropTypes.string.isRequired,
			value: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ),
		} ),
	),
	settings: PropTypes.arrayOf( PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ) ),
};
