import * as React from 'react';
import { openDialog } from '@elementor/editor-global-dialog';

import { type API_ERROR_CODES } from '../api';
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

	if ( code === 'DUPLICATED_LABEL' ) {
		openDialog( {
			component: <DuplicateLabelDialog modifiedLabels={ modifiedLabels } />,
		} );
	}
};
