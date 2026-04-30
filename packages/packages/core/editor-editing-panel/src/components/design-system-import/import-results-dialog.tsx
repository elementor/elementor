import * as React from 'react';
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogHeader,
	DialogTitle,
	Stack,
	Typography,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type ImportResult } from './state';

type Props = {
	open: boolean;
	result: ImportResult | null;
	onClose: () => void;
};

export const ImportResultsDialog = ( { open, result, onClose }: Props ) => {
	const successful = result?.successfulCount ?? 0;
	const unsuccessful = result?.unsuccessfulCount ?? 0;

	return (
		<Dialog open={ open } onClose={ onClose } maxWidth="xs" fullWidth>
			<DialogHeader logo={ false }>
				<DialogTitle>{ __( 'Import results', 'elementor' ) }</DialogTitle>
			</DialogHeader>
			<DialogContent>
				<Stack spacing={ 1 }>
					<Stack direction="row" justifyContent="space-between">
						<Typography variant="body2">{ __( 'Successful', 'elementor' ) }</Typography>
						<Typography variant="body2" color="success.main">
							{ successful }
						</Typography>
					</Stack>
					<Stack direction="row" justifyContent="space-between">
						<Typography variant="body2">{ __( 'Unsuccessful', 'elementor' ) }</Typography>
						<Typography variant="body2" color="error.main">
							{ unsuccessful }
						</Typography>
					</Stack>
				</Stack>
			</DialogContent>
			<DialogActions>
				<Button size="medium" variant="contained" color="primary" onClick={ onClose }>
					{ __( 'Close', 'elementor' ) }
				</Button>
			</DialogActions>
		</Dialog>
	);
};
