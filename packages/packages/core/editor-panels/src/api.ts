import { type ComponentType } from 'react';
import { __privateUseRouteStatus as useRouteStatus, type UseRouteStatusOptions } from '@elementor/editor-v1-adapters';
import { __useDispatch as useDispatch, __useSelector as useSelector } from '@elementor/store';

import { injectIntoPanels } from './location';
import { selectOpenId, slice } from './store';
import { V2_PANEL } from './sync';

export type PanelDeclaration< TOnOpenReturn = unknown > = {
	id: string;
	component: ComponentType;
} & UseActionsOptions< TOnOpenReturn > &
	UseRouteStatusOptions;

export function createPanel< TOnOpenReturn >( {
	id,
	component,
	onOpen,
	onClose,
	allowedEditModes,
	blockOnKitRoutes,
}: PanelDeclaration< TOnOpenReturn > ) {
	const usePanelStatus = createUseStatus( id, {
		allowedEditModes,
		blockOnKitRoutes,
	} );

	const usePanelActions = createUseActions( id, usePanelStatus, {
		onOpen,
		onClose,
	} );

	return {
		panel: {
			id,
			component,
		},
		usePanelStatus,
		usePanelActions,
	};
}

export function registerPanel( { id, component }: Pick< PanelDeclaration, 'id' | 'component' > ) {
	injectIntoPanels( {
		id,
		component,
	} );
}

type UseStatus = () => {
	isOpen: boolean;
	isBlocked: boolean;
};

function createUseStatus( id: PanelDeclaration[ 'id' ], options: UseRouteStatusOptions = {} ): UseStatus {
	return () => {
		const openPanelId = useSelector( selectOpenId );
		const v1PanelStatus = useRouteStatus( V2_PANEL, options );

		return {
			isOpen: openPanelId === id && v1PanelStatus.isActive,
			isBlocked: v1PanelStatus.isBlocked,
		};
	};
}

type UseActionsOptions< TOnOpenReturn > = {
	onOpen?: () => TOnOpenReturn;
	onClose?: ( state: TOnOpenReturn ) => void;
};

function createUseActions< TOnOpenReturn >(
	id: PanelDeclaration[ 'id' ],
	useStatus: UseStatus,
	options: UseActionsOptions< TOnOpenReturn > = {}
) {
	let stateSnapshot: TOnOpenReturn | null = null;

	return () => {
		const dispatch = useDispatch();
		const { isBlocked } = useStatus();

		return {
			open: async () => {
				if ( isBlocked ) {
					return;
				}

				dispatch( slice.actions.open( id ) );

				stateSnapshot = options.onOpen?.() ?? null;
			},
			close: async () => {
				if ( isBlocked ) {
					return;
				}

				dispatch( slice.actions.close( id ) );

				options.onClose?.( stateSnapshot as TOnOpenReturn );
			},
		};
	};
}
