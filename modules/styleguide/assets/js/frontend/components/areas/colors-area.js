import React, { useContext, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { ActiveElementContext } from '../../context/active-element';
import { addEventListener, AFTER_COMMAND_EVENT } from '../../utils/top-events';
import Area from './area';
import Color from '../item/color';

const Wrapper = styled.div`
	width: 100%;
	margin-top: 95px;

	@media (max-width: 1024px) {
		margin-top: 45px;
	}
`;

export default function ColorsArea() {
	const ref = useRef( null );
	// const { setActive, unsetActive } = useContext( ActiveElementContext );

	const onPickerHide = ( event ) => {
		unsetActive( event.detail.instance.options.container.id, 'colors' );
	};

	const onPickerShow = ( event ) => {
		setActive( event.detail.instance.options.container.id, 'colors' );
	};

	const onPanelShow = ( event ) => {
		const command = 'panel/global/global-colors';

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
		addEventListener( 'elementor/global-color/show', onPickerShow );
		addEventListener( 'elementor/global-color/hide', onPickerHide );
		addEventListener( AFTER_COMMAND_EVENT, onPanelShow );

		return () => {
			removeEventListener( 'elementor/global-color/show', onPickerShow );
			removeEventListener( 'elementor/global-color/hide', onPickerHide );
			removeEventListener( AFTER_COMMAND_EVENT, onPanelShow );
		};
	}, [] );

	const areaConfig = {
		title: __( 'Global Colors', 'elementor' ),
		type: 'colors',
		component: Color,
		sections: [
			{
				type: 'system_colors',
				title: __( 'System Colors', 'elementor' ),
				columns: {
					desktop: 4,
					mobile: 2,
				},
			},
			{
				type: 'custom_colors',
				title: __( 'Custom Colors', 'elementor' ),
				columns: {
					desktop: 6,
					mobile: 2,
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
