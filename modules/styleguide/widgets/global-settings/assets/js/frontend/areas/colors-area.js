import React, { useContext, useEffect } from 'react';
import AreaTitle from "../components/area-title";
import ColorsSection from "../components/colors-section";
import { ActiveElementContext } from "../providers/active-element-provider";
import { addEventListener, AFTER_COMMAND_EVENT } from "../../../../../assets/js/common/utils/top-events";

const ColorsArea = React.forwardRef( ( { settings }, ref ) => {
	const { setActive, unsetActive } = useContext( ActiveElementContext );

	useEffect( () => {
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

		addEventListener( 'elementor/global-color/show', onPickerShow );
		addEventListener( 'elementor/global-color/hide', onPickerHide );
		addEventListener( AFTER_COMMAND_EVENT, onPanelShow );

		return () => {
			removeEventListener( 'elementor/global-color/show', onPickerShow );
			removeEventListener( 'elementor/global-color/hide', onPickerHide );
			removeEventListener( AFTER_COMMAND_EVENT, onPanelShow );
		};

	}, [] );

	return (
		<div ref={ ref }>
			<AreaTitle name='colors'>global colors</AreaTitle>
			<ColorsSection title='System Colors'
			               source={ settings[ 'system_colors' ] }
			               colorWidth='191px'
			               type='system'
			/>
			<ColorsSection title='Custom Colors'
			               source={ settings[ 'custom_colors' ] }
			               colorWidth='114px'
			               type='custom'
			/>
        </div>
	);
} );

export default ColorsArea;