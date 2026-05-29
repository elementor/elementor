import * as React from 'react';
import { __useDispatch as useDispatch, __useSelector as useSelector } from '@elementor/store';

import { useFloatingPanelsInjections } from '../../location';
import { selectOpenPanelIds, selectPanelState, selectTopZIndex } from '../../store/selectors';
import { slice } from '../../store/slice';
import PanelWindow from './panel-window';

export default function FloatingPanelsHost() {
	const openIds = useSelector( selectOpenPanelIds );
	const topZIndex = useSelector( selectTopZIndex );
	const injections = useFloatingPanelsInjections();
	const dispatch = useDispatch();

	const declarationById = React.useMemo( () => {
		return Object.fromEntries( injections.map( ( inj ) => [ inj.id, inj ] ) );
	}, [ injections ] );

	React.useEffect( () => {
		function onKeyDown( event: KeyboardEvent ) {
			if ( event.key !== 'Escape' ) {
				return;
			}

			const focusedId = openIds[ openIds.length - 1 ];

			if ( focusedId ) {
				dispatch( slice.actions.close( focusedId ) );
			}
		}

		document.addEventListener( 'keydown', onKeyDown );

		return () => document.removeEventListener( 'keydown', onKeyDown );
	}, [ openIds, dispatch ] );

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
						topZIndex={ topZIndex }
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
}: {
	id: string;
	children: React.ReactNode;
	onFocus: () => void;
	topZIndex: number;
} ) {
	const panel = useSelector( ( state ) => selectPanelState( state, id ) );

	if ( ! panel ) {
		return null;
	}

	return (
		<PanelWindow panelId={ id } zIndex={ 1000 + panel.zIndex } onFocus={ onFocus }>
			{ children }
		</PanelWindow>
	);
}
