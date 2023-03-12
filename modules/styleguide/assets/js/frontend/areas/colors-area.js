import React, { useContext, useEffect, useRef } from 'react';
import AreaTitle from './area-title';
import Section from '../components/section';
import { ActiveElementContext } from '../providers/active-element-provider';
import { addEventListener, AFTER_COMMAND_EVENT } from '../utils/top-events';
import useSettings from '../hooks/use-settings';
import styled from 'styled-components';
import Loader from '../components/global/loader';
import Color from '../components/item/color';

const Wrapper = styled.div`
	width: 100%;
	margin-top: 95px;

	@media (max-width: 1024px) {
		margin-top: 45px;
	}
`;

export default function ColorsArea() {
	const ref = useRef( null );
	const { setActive, unsetActive } = useContext( ActiveElementContext );

	const { isLoading, settings } = useSettings( { type: 'colors' } );

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

	if ( isLoading ) {
		return <Loader />;
	}

	return (
		<Wrapper ref={ ref }>
			<AreaTitle name="colors">Global Colors</AreaTitle>
			<Section title="System Colors"
				source={ settings.system_colors }
				colorWidth="191px"
				component={ Color }
				type="system"
			/>
			<Section title="Custom Colors"
				source={ settings.custom_colors }
				colorWidth="114px"
				component={ Color }
				type="custom"
			/>
		</Wrapper>
	);
}
