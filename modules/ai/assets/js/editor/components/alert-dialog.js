import { useState } from 'react';
import { Button, Dialog, DialogContent, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

export const AlertDialog = ( props ) => {
	const [ isShown, setIsShown ] = useState( true );

	if ( ! isShown ) {
		return null;
	}

	return (
		<Dialog
			open={ true }
			maxWidth="lg"
		>
			<DialogContent
				sx={ {
					padding: 0,
				} }
			>
				<Typography
					sx={ {
						textAlign: 'center',
						padding: 3,
					} }
				>
					{ props.message }
				</Typography>

				<Stack alignItems="center" spacing={ 2 } marginBottom={ 2 }>
					<Button
						variant="contained"
						type="button"
						color="primary"
						onClick={ () => {
							setIsShown( false );
							props.onClose?.();
						} }
					>
						{ __( 'Close', 'elementor' ) }
					</Button>
				</Stack>

			</DialogContent>
		</Dialog>
	);
};

AlertDialog.propTypes = {
	message: PropTypes.string.isRequired,
	onClose: PropTypes.func,
};
