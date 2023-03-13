import React, { useContext, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { ActiveElementContext } from '../../context/active-element';
import { addEventListener, AFTER_COMMAND_EVENT } from '../../utils/top-events';
import Area from './area';
import Font from '../item/font';

const Wrapper = styled.div`
	width: 100%;
	margin-top: 95px;

	@media (max-width: 640px) {
		margin-top: 45px;
	}
`;

export default function FontsArea() {
	const ref = useRef( null );
	const { setActive, unsetActive } = useContext( ActiveElementContext );

	const onPopoverToggle = ( event ) => {
		const name = event.detail.container.model.attributes.name;

		if ( ! name.includes( 'typography' ) ) {
			return;
		}

		if ( event.detail.visible ) {
			setActive( event.detail.container.id, 'typography' );
		} else {
			unsetActive( event.detail.container.id, 'typography' );
		}
	};

	const onPanelShow = ( event ) => {
		const command = 'panel/global/global-typography';
		if ( event.detail.command !== command ) {
			return;
		}

		if ( event.detail.args.shouldNotScroll ) {
			return;
		}

		setTimeout( () => {
			ref.current.scrollIntoView( { behavior: 'smooth' } );
		}, 100 );
	};

	useEffect( () => {
		addEventListener( 'elementor/popover/toggle', onPopoverToggle );
		addEventListener( AFTER_COMMAND_EVENT, onPanelShow );

		return () => {
			removeEventListener( 'elementor/popover/toggle', onPopoverToggle );
			removeEventListener( AFTER_COMMAND_EVENT, onPanelShow );
		};
	}, [] );

	const areaConfig = {
		title: __( 'Global Fonts', 'elementor' ),
		type: 'fonts',
		component: Font,
		sections: [
			{
				type: 'system_typography',
				title: __( 'System Fonts', 'elementor' ),
				flex: 'column',
				columns: {
					desktop: 1,
					mobile: 1,
				},
			},
			{
				type: 'custom_typography',
				title: __( 'Custom Fonts', 'elementor' ),
				flex: 'column',
				columns: {
					desktop: 1,
					mobile: 1,
				},
			},
		],
	};

	return (
		<Wrapper ref={ ref }>
			<Area config={ areaConfig } />
		</Wrapper>
	);
}
