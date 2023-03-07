import React, { useContext, useEffect } from 'react';
import AreaTitle from '../components/area-title';
import FontsSection from '../components/fonts-section';
import { ActiveElementContext } from '../providers/active-element-provider';
import { addEventListener, AFTER_COMMAND_EVENT } from '../../utils/top-events';
import styled from "styled-components";

const Wrapper = styled.div`
	width:100%;
  margin-top:95px;
`;

const FontsArea = React.forwardRef( ( { settings }, ref ) => {
	const { setActive, unsetActive } = useContext( ActiveElementContext );

	useEffect( () => {
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

		addEventListener( 'elementor/popover/toggle', onPopoverToggle );
		addEventListener( AFTER_COMMAND_EVENT, onPanelShow );

		return () => {
			removeEventListener( 'elementor/popover/toggle', onPopoverToggle );
			removeEventListener( AFTER_COMMAND_EVENT, onPanelShow );
		}
	}, [] );

	return (
		<Wrapper ref={ ref }>
			<AreaTitle name="fonts">global fonts</AreaTitle>
			<FontsSection title="System Fonts"
				source={ settings.system_typography }
				type="system"
			/>
			<FontsSection title="Custom Fonts"
				source={ settings.custom_typography }
				type="custom"
			/>
		</Wrapper>
	);
} );

export default FontsArea;
