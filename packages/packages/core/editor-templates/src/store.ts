import { type Document } from '@elementor/editor-documents';
import { __createSelector, __createSlice, type PayloadAction, type SliceState } from '@elementor/store';

type State = {
	entities: Record< Document[ 'id' ], Document >;
};

const initialState: State = {
	entities: {},
};

export const slice = __createSlice( {
	name: 'templates',
	initialState,
	reducers: {
		setTemplates( state, action: PayloadAction< Document[] > ) {
			action.payload.forEach( ( doc ) => {
				state.entities[ doc.id ] = doc;
			} );
		},

		clearTemplates( state ) {
			state.entities = {};
		},
	},
} );

export type Slice = SliceState< typeof slice >;

const selectEntities = ( state: Slice ) => state.templates.entities;

export const selectTemplates = __createSelector( [ selectEntities ], ( entities ): Document[] =>
	Object.values( entities )
);
