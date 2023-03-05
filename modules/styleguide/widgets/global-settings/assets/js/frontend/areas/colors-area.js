import React, { useContext, useEffect } from 'react';
import AreaTitle from "../components/area-title";
import ColorsSection from "../components/colors-section";
import { ActiveElementContext } from "../providers/active-element-provider";
import {
	addEventListener,
	addHook,
	AFTER_COMMAND_EVENT,
	removeHook
} from "../../../../../assets/js/common/utils/top-events";

const ColorsArea = React.forwardRef( ( { settings }, ref ) => {
	const { setActive, unsetActive } = useContext( ActiveElementContext );

	useEffect( () => {
		const shownEvent = 'panel/global/global-colors/picker/shown';
		const hiddenEvent = 'panel/global/global-colors/picker/hidden';

		const onPickerHide = () => {
			unsetActive();
		};

		const onPickerShow = ( event ) => {
			setActive( event.instance.options.container.id, 'colors' );
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

		addHook( shownEvent, onPickerShow );
		addHook( hiddenEvent, onPickerHide );
		addEventListener( AFTER_COMMAND_EVENT, onPanelShow );

		return () => {
			removeHook( shownEvent, onPickerShow );
			removeHook( hiddenEvent, onPickerHide );
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