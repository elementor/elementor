import * as React from 'react';
import { closeDialog, openDialog } from '@elementor/editor-global-dialog';
import { InfoCircleFilledIcon } from '@elementor/icons';
import { Box, Button, Icon, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { API_ERROR_CODES } from '../api';
import { DuplicateLabelDialog } from './class-manager/duplicate-label-dialog';

export type ErrorDialogData = {
	message: string;
	code: typeof API_ERROR_CODES | string;
	data: {
		status: number;
		meta: {
			key: string; // The duplicated label
			duplicated_label: string;
		};
	};
};

type ErrorDialogProps = {
	code: string;
	message: string;
	modifiedLabels: {
		original: string;
		modified: string;
		id: string;
	}[];
};

export const showErrorDialog = ( data: ErrorDialogProps ) => {
	const { code, modifiedLabels } = data;


	const handleButtonClick = () => {
		localStorage.setItem( 'elementor-global-classes-search', 'DUP_' );
		open();
		closeDialog();
	};

	if ( code === API_ERROR_CODES.DUPLICATED_LABEL ) {
		openDialog( {
			title: (
				<Box display="flex" alignItems="center" gap={ 1 }>
					<Icon color="secondary">
						<InfoCircleFilledIcon fontSize="medium" />
					</Icon>
					<Typography variant="subtitle1">
						{ __( 'We’ve published your page and updated class names.', 'elementor' ) }
					</Typography>
				</Box>
			),
			component: <DuplicateLabelDialog modifiedLabels={ modifiedLabels } />,
			actions: <>
				<Button color="secondary" variant="text"  onClick={ handleButtonClick }>
					{ __( 'Go to Class Manager', 'elementor' ) }
				</Button>
				<Button color="secondary" variant="contained"    onClick={ ()=>closeDialog() }>
					{ __( 'Done', 'elementor' ) }
				</Button>
			</>,
		} );
	}
};
