import type { Slice } from './index';
import { createSelector, SliceState } from '@elementor/store';
import {
	Document,
	selectActiveDocument as selectCoreActiveDocument,
	selectHostDocument as selectCoreHostDocument,
} from '@elementor/documents';
import { ProDocument } from '../types';

type State = SliceState<Slice>;

const selectProEntities = ( state: State ) => state[ 'pro-documents' ].entities;

const selectDocument = ( coreDocument: Document | null, proEntities: State['pro-documents']['entities'] ): ( Document & ProDocument ) | null => {
	if ( ! coreDocument ) {
		return null;
	}

	const { id } = coreDocument;

	if ( ! proEntities[ id ] ) {
		return {
			...coreDocument,
			locationKey: null,
		};
	}

	return {
		...coreDocument,
		...proEntities[ id ],
	};
};

export const selectActiveDocument = createSelector(
	selectCoreActiveDocument,
	selectProEntities,
	selectDocument,
);

export const selectHostDocument = createSelector(
	selectCoreHostDocument,
	selectProEntities,
	selectDocument,
);
