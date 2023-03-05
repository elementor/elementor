import React, { useContext, useEffect } from 'react';
import AreaTitle from "../components/area-title";
import FontsSection from "../components/fonts-section";
import { ActiveElementContext } from "../providers/active-element-provider";
import {
	AFTER_COMMAND_EVENT,
	addEventListener,
	addHook,
	removeHook,
} from "../../../../../assets/js/common/utils/top-events";

const FontsArea = React.forwardRef( ( { settings }, ref ) => {
	const { setActive, unsetActive } = useContext( ActiveElementContext );

	useEffect( () => {
		const shownEvent = 'panel/global/global-typography/picker/shown';
		const hiddenEvent = 'panel/global/global-typography/picker/hidden';

		const onPopoverShow = ( event ) => {
			let name = event.container.model.attributes.name;
			if ( ! name.includes( 'typography' ) ) {
				return;
			}

			setActive( event.container.id, 'typography' );
		};
		const onPopoverHide = () => {
			unsetActive();
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

		addHook( shownEvent, onPopoverShow );
		addHook( hiddenEvent, onPopoverHide );
		addEventListener( AFTER_COMMAND_EVENT, onPanelShow );

		return () => {
			removeHook( shownEvent, onPopoverShow );
			removeHook( hiddenEvent, onPopoverHide );
			removeEventListener( AFTER_COMMAND_EVENT, onPanelShow );
		}
	}, [] );

	return (
		<div ref={ ref }>
			<AreaTitle name='fonts'>global fonts</AreaTitle>
			<FontsSection title='System Fonts'
			              source={ settings[ 'system_typography' ] }
			              type='system'
			/>
			<FontsSection title='Custom Fonts'
			              source={ settings[ 'custom_typography' ] }
			              type='custom'
			/>
        </div>
	);
} );

export default FontsArea;