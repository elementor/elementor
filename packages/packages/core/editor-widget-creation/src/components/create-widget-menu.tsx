import * as React from 'react';
import { useEffect, useState } from 'react';
import { ThemeProvider } from '@elementor/editor-ui';
import { MenuItem, MenuList, Popover, type Theme } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { CREATE_WIDGET_EVENT } from './create-widget';

type OpenMenuEventDetail = {
	anchorPosition: { top: number; left: number };
};

const OPEN_MENU_EVENT = 'elementor/editor/open-create-widget-menu';

export function CreateWidgetMenu() {
	const [ anchorPosition, setAnchorPosition ] = useState< { top: number; left: number } | null >( null );

	useEffect( () => {
		const handleOpenMenu = ( event: Event ) => {
			const customEvent = event as CustomEvent< OpenMenuEventDetail >;
			setAnchorPosition( customEvent.detail.anchorPosition );
		};

		window.addEventListener( OPEN_MENU_EVENT, handleOpenMenu );

		return () => {
			window.removeEventListener( OPEN_MENU_EVENT, handleOpenMenu );
		};
	}, [] );

	const handleClose = () => {
		setAnchorPosition( null );
	};

	const handleCreateWithAngie = () => {
		handleClose();
		openCreateWidgetModal( { entryPoint: 'widgets_panel' } );
	};

	const handleBrowseCommunityLibrary = () => {
		handleClose();
		openCreateWidgetModal( { entryPoint: 'widgets_panel', openCommunityLibrary: true } );
	};

	return (
		<ThemeProvider>
			<Popover
				open={ anchorPosition !== null }
				onClose={ handleClose }
				anchorReference="anchorPosition"
				anchorPosition={ anchorPosition ?? undefined }
				transformOrigin={ {
					vertical: 'top',
					horizontal: 'right',
				} }
				slotProps={ {
					paper: { sx: ( theme: Theme ) => ( { borderRadius: `${ theme.shape.borderRadius / 2 }px` } ) },
				} }
			>
				<MenuList dense>
					<MenuItem onClick={ handleCreateWithAngie }>{ __( 'Create with Angie', 'elementor' ) }</MenuItem>
					<MenuItem onClick={ handleBrowseCommunityLibrary }>
						{ __( 'Browse Community Library', 'elementor' ) }
					</MenuItem>
				</MenuList>
			</Popover>
		</ThemeProvider>
	);
}


function openCreateWidgetModal( { entryPoint, openCommunityLibrary = false }: { entryPoint: string, openCommunityLibrary?: boolean } ) {
	window.dispatchEvent(
		new CustomEvent( CREATE_WIDGET_EVENT, {
			detail: {
				entry_point: entryPoint,
				openCommunityLibrary: openCommunityLibrary,
			},
		} )
	);
}