import * as React from 'react';
import { openDialog } from '@elementor/editor-global-dialog';
import { AlertOctagonFilledIcon } from '@elementor/icons';
import { Box, Icon, Typography } from '@elementor/ui';
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

type TempType = {
	code: string;
	message: string;
	modified_labels: {
		original: string;
		modified: string;
		item_id: string;
	}[];
};

export const showErrorDialog = ( data: TempType ) => {
	const { code, modified_labels: modifiedLabels } = data;

	if ( code === API_ERROR_CODES.DUPLICATED_LABEL ) {
		openDialog( {
			title: (
				<Box display="flex" alignItems="center" gap={ 1 }>
					<Icon color="secondary">
						<AlertOctagonFilledIcon />
					</Icon>
					<Typography variant="subtitle2">
						{ __( 'Page published - with class name updates', 'elementor' ) }
					</Typography>
				</Box>
			),
			component: <DuplicateLabelDialog modifiedLabels={ modifiedLabels } />,
		} );
	}
};
