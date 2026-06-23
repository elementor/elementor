import { __createSlice, type PayloadAction } from '@elementor/store';

import { type FloatingPanelDefaults, type FloatingPanelState, type LogicalPosition, type LogicalSize } from '../types';

type SliceState = {
	byId: Record< string, FloatingPanelState >;
	minSizeById: Record< string, LogicalSize >;
	titlesById: Record< string, string >;
	isDraggableById: Record< string, boolean >;
	isResizableById: Record< string, boolean >;
	topZIndex: number;
};

const DEFAULT_PANEL_POSITION: LogicalPosition = { insetInlineStart: 24, insetBlockStart: 80 };

const initialState: SliceState = {
	byId: {},
	minSizeById: {},
	titlesById: {},
	isDraggableById: {},
	isResizableById: {},
	topZIndex: 0,
};

export const slice = __createSlice( {
	name: 'floatingPanels',
	initialState,
	reducers: {
		register(
			state,
			action: PayloadAction< {
				id: string;
				defaults: FloatingPanelDefaults;
				title?: string;
				isDraggable?: boolean;
				isResizable?: boolean;
				persisted?: FloatingPanelState;
			} >
		) {
			const { id, defaults, title, isDraggable, isResizable, persisted } = action.payload;

			state.minSizeById[ id ] = { inlineSize: defaults.minWidth, blockSize: defaults.minHeight };
			state.isDraggableById[ id ] = isDraggable ?? false;
			state.isResizableById[ id ] = isResizable ?? false;

			if ( title !== undefined ) {
				state.titlesById[ id ] = title;
			}

			if ( state.byId[ id ] ) {
				return;
			}

			state.byId[ id ] = persisted ?? {
				isOpen: false,
				position: defaults.initialPosition ?? DEFAULT_PANEL_POSITION,
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
		setPosition( state, action: PayloadAction< { id: string; position: LogicalPosition } > ) {
			const panel = state.byId[ action.payload.id ];

			if ( panel ) {
				panel.position = action.payload.position;
			}
		},
		setSize( state, action: PayloadAction< { id: string; size: LogicalSize } > ) {
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
