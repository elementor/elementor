import * as React from 'react';
import { Button, DialogActions, DialogContent, DialogHeader, DialogTitle, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type ImportResult } from './types';

type Props = {
	result: ImportResult;
	onClose: () => void;
};

export const ImportResultsDialog = ( { result, onClose }: Props ) => {
	return (
		<>
			<DialogHeader logo={ false }>
				<DialogTitle>{ __( 'Import results', 'elementor' ) }</DialogTitle>
			</DialogHeader>
			<DialogContent>
				<Stack spacing={ 1 }>
					<Stack direction="row" justifyContent="space-between">
						<Typography variant="body2">{ __( 'Successful', 'elementor' ) }</Typography>
						<Typography variant="body2" color="success.main">
							{ result.successfulCount }
						</Typography>
					</Stack>
					<Stack direction="row" justifyContent="space-between">
						<Typography variant="body2">{ __( 'Unsuccessful', 'elementor' ) }</Typography>
						<Typography variant="body2" color="error.main">
							{ result.unsuccessfulCount }
						</Typography>
					</Stack>
				</Stack>
			</DialogContent>
			<DialogActions>
				<Button size="medium" variant="contained" color="primary" onClick={ onClose }>
					{ __( 'Close', 'elementor' ) }
				</Button>
			</DialogActions>
		</>
	);
};
