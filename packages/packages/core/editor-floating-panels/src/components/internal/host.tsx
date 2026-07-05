import { type ReactNode, useMemo } from 'react';
import { useEditMode } from '@elementor/editor-v1-adapters';
import { __useDispatch as useDispatch, __useSelector as useSelector } from '@elementor/store';

import { useFloatingPanelsInjections } from '../../location';
import {
	type GlobalState,
	resolvePanelZIndex,
	selectOpenPanelIds,
	selectPanelState,
	selectPanelTitle,
} from '../../store/selectors';
import { slice } from '../../store/slice';
import PanelWindow from './panel-window';

export default function FloatingPanelsHost() {
	const openIds = useSelector( selectOpenPanelIds );
	const injections = useFloatingPanelsInjections();
	const dispatch = useDispatch();
	const isPreviewMode = useEditMode() === 'preview';

	const declarationById = useMemo( () => {
		return Object.fromEntries( injections.map( ( inj ) => [ inj.id, inj ] ) );
	}, [ injections ] );

	return (
		<>
			{ openIds.map( ( id ) => {
				const declaration = declarationById[ id ];

				if ( ! declaration ) {
					return null;
				}

				const Component = declaration.component;

				return (
					<HostedPanel
						key={ id }
						id={ id }
						visible={ ! isPreviewMode }
						onFocus={ () => dispatch( slice.actions.bringToFront( id ) ) }
					>
						<Component />
					</HostedPanel>
				);
			} ) }
		</>
	);
}

function HostedPanel( {
	id,
	children,
	onFocus,
	visible,
}: {
	id: string;
	children: ReactNode;
	onFocus: () => void;
	visible: boolean;
} ) {
	const panel = useSelector( ( state: GlobalState ) => selectPanelState( state, id ) );
	const title = useSelector( ( state: GlobalState ) => selectPanelTitle( state, id ) );
	const zIndex = useSelector( ( state: GlobalState ) => resolvePanelZIndex( state, id ) );

	if ( ! panel ) {
		return null;
	}

	return (
		<PanelWindow
			panelId={ id }
			corner={ panel.corner }
			position={ panel.position }
			size={ panel.size }
			zIndex={ zIndex }
			visible={ visible }
			onFocus={ onFocus }
			title={ title }
		>
			{ children }
		</PanelWindow>
	);
}
