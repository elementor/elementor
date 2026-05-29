import { __createSlice, type PayloadAction } from '@elementor/store';

import { type DockMode, type FloatingPanelDefaults, type FloatingPanelState, type LogicalPosition } from '../types';

type SliceState = {
	byId: Record< string, FloatingPanelState >;
	topZIndex: number;
};

const initialState: SliceState = {
	byId: {},
	topZIndex: 0,
};

export const slice = __createSlice( {
	name: 'floatingPanels',
	initialState,
	reducers: {
		register(
			state,
			action: PayloadAction< { id: string; defaults: FloatingPanelDefaults; persisted?: FloatingPanelState } >
		) {
			const { id, defaults, persisted } = action.payload;

			if ( state.byId[ id ] ) {
				return;
			}

			state.byId[ id ] = persisted ?? {
				isOpen: false,
				mode: defaults.initialMode,
				position: defaults.initialPosition ?? { insetInlineStart: 24, insetBlockStart: 80 },
				size: { inlineSize: defaults.width, blockSize: defaults.height },
				zIndex: 0,
			};

			if ( persisted && persisted.zIndex > state.topZIndex ) {
				state.topZIndex = persisted.zIndex;
			}
		},
		open( state, action: PayloadAction< string > ) {
			const panel = state.byId[ action.payload ];

			if ( panel ) {
				panel.isOpen = true;
			}
		},
		close( state, action: PayloadAction< string > ) {
			const panel = state.byId[ action.payload ];

			if ( panel ) {
				panel.isOpen = false;
			}
		},
		setMode( state, action: PayloadAction< { id: string; mode: DockMode } > ) {
			const panel = state.byId[ action.payload.id ];

			if ( panel ) {
				panel.mode = action.payload.mode;
			}
		},
		setPosition( state, action: PayloadAction< { id: string; position: LogicalPosition } > ) {
			const panel = state.byId[ action.payload.id ];

			if ( panel ) {
				panel.position = action.payload.position;
			}
		},
		setSize(
			state,
			action: PayloadAction< { id: string; size: { inlineSize: number; blockSize: number } } >
		) {
			const panel = state.byId[ action.payload.id ];

			if ( panel ) {
				panel.size = action.payload.size;
			}
		},
		bringToFront( state, action: PayloadAction< string > ) {
			const panel = state.byId[ action.payload ];

			if ( ! panel ) {
				return;
			}

			state.topZIndex += 1;
			panel.zIndex = state.topZIndex;
		},
	},
} );

export type FloatingPanelsSliceState = SliceState;
