import { __createSlice, type PayloadAction } from '@elementor/store';

import { type FloatingPanelDefaults, type FloatingPanelState, type LogicalPosition, type LogicalSize } from '../types';
import { buildInitialPosition, type PanelCorner } from '../utils/corner-position';

type SliceState = {
	byId: Record< string, FloatingPanelState >;
	minSizeById: Record< string, LogicalSize >;
	titlesById: Record< string, string >;
	isDraggableById: Record< string, boolean >;
	isResizableById: Record< string, boolean >;
	isDockedById: Record< string, boolean >;
	topZIndex: number;
};

const DEFAULT_CORNER: PanelCorner = 'block-start-inline-start';

const initialState: SliceState = {
	byId: {},
	minSizeById: {},
	titlesById: {},
	isDraggableById: {},
	isResizableById: {},
	isDockedById: {},
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
				isDocked?: boolean;
				persisted?: FloatingPanelState;
			} >
		) {
			const { id, defaults, title, isDraggable, isResizable, isDocked, persisted } = action.payload;

			state.minSizeById[ id ] = { inlineSize: defaults.minWidth, blockSize: defaults.minHeight };
			state.isDraggableById[ id ] = isDocked ? false : isDraggable ?? false;
			state.isResizableById[ id ] = isDocked ? false : isResizable ?? false;
			state.isDockedById[ id ] = isDocked ?? false;

			if ( title !== undefined ) {
				state.titlesById[ id ] = title;
			}

			if ( state.byId[ id ] ) {
				return;
			}

			const corner = defaults.corner ?? DEFAULT_CORNER;
			const canReusePersisted = ! isDocked && persisted && persisted.corner === corner;
			const size = { inlineSize: defaults.width, blockSize: defaults.height };

			if ( isDocked && persisted && persisted.size.inlineSize >= defaults.minWidth ) {
				size.inlineSize = persisted.size.inlineSize;
			}

			state.byId[ id ] = canReusePersisted
				? persisted
				: {
						isOpen: false,
						corner,
						position: buildInitialPosition( corner, defaults.initialPosition ),
						size,
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
