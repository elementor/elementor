import * as React from 'react';
import { openDialog } from '@elementor/editor-ui';
import { __dispatch as dispatch } from '@elementor/store';

import { type API_ERROR_CODES } from '../api';
import { type ModifiedLabels, slice } from '../store';
import { DuplicateLabelDialog } from './class-manager/duplicate-label-dialog';

export type ErrorDialogData = {
	message: string;
	code: typeof API_ERROR_CODES | string;
	data: {
		status: number;
		meta: {
			key: string;
			duplicated_label: string;
		};
	};
};

type ErrorDialogProps = {
	code: string;
	message: string;
	modifiedLabels: ModifiedLabels;
};

export const showErrorDialog = ( data: ErrorDialogProps ) => {
	const { code, modifiedLabels } = data;
	if ( code === 'DUPLICATED_LABEL' ) {
		dispatch( slice.actions.updateMultiple( modifiedLabels ) );
		openDialog( {
			component: <DuplicateLabelDialog modifiedLabels={ modifiedLabels } />,
		} );
	}
};
