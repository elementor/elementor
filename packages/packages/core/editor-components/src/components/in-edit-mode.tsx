import * as React from 'react';
import { closeDialog, openDialog } from '@elementor/editor-ui';
import { InfoCircleFilledIcon } from '@elementor/icons';
import { Box, Button, DialogActions, DialogContent, DialogHeader, Icon, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export const openEditModeDialog = ( lockedBy: string ) => {
	openDialog( {
		component: <EditModeDialog lockedBy={ lockedBy } />,
	} );
};

const EditModeDialog = ( { lockedBy }: { lockedBy: string } ) => {
	return (
		<>
			<DialogHeader logo={ false }>
				<Box display="flex" alignItems="center" gap={ 1 }>
					<Icon color="secondary">
						<InfoCircleFilledIcon fontSize="medium" />
					</Icon>
					<Typography variant="subtitle1">
						{ /* translators: %s is the name of the user who is currently editing the document */ }
						{ __( '%s is currently editing this document', 'elementor' ).replace( '%s', lockedBy ) }
					</Typography>
				</Box>
			</DialogHeader>
			<DialogContent>
				<Stack spacing={ 2 } direction="column">
					<Typography variant="body2">
						{ __(
							'You can wait for them to finish or reach out to coordinate your changes together.',
							'elementor'
						) }
					</Typography>
					<DialogActions>
						<Button color="secondary" variant="contained" onClick={ closeDialog }>
							{ __( 'Close', 'elementor' ) }
						</Button>
					</DialogActions>
				</Stack>
			</DialogContent>
		</>
	);
};
