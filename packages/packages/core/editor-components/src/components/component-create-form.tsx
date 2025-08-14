import * as React from 'react';
import { ThemeProvider } from '@elementor/editor-ui';
import { HeartHandShakeIcon } from '@elementor/icons';
import {
	Button,
	FormLabel,
	Grid,
	Popover,
	Stack,
	TextField,
	Typography,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { apiClient } from '../api';
import { useEffect, useRef, useState } from 'react';

type ElementData = {
	id: string;
	elType: string;
	widgetType?: string;
	elements: ElementData[];
	settings: Record<string, any>;
	styles: any[];
};

type SaveAsComponentEventData = {
	componentContent: ElementData[];
	anchorPosition: { top: number; left: number };
};

const FONT_SIZE = 'tiny';
const OPEN_SAVE_AS_COMPONENT_POPUP_EVENT = 'elementor/editor/open-save-as-component-popup';

export function ComponentCreateForm() {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ isLoading, setIsLoading ] = useState( false );

	const [ componentName, setComponentName ] = useState( '' );
	const [ anchorPosition, setAnchorPosition ] = useState<{ top: number; left: number } | null>( null );

	const componentContent = useRef<ElementData[]>( [] );

	const openModal = ( event: CustomEvent< SaveAsComponentEventData > ) => {
		componentContent.current = event.detail.componentContent;
		setComponentName( getComponentDefaultName( event.detail.componentContent ) );
		setAnchorPosition( event.detail.anchorPosition );

		setIsOpen( true );
	};

	useEffect( () => {
		window.addEventListener(OPEN_SAVE_AS_COMPONENT_POPUP_EVENT,openModal as EventListener);

		return () => {
			window.removeEventListener(OPEN_SAVE_AS_COMPONENT_POPUP_EVENT,openModal as EventListener);
		};
	}, [] );

	const handleSave = async () => {
		if ( ! componentContent.current || ! componentName.trim() ) {
			return;
		}

		setIsLoading( true );

		try {
			const result = await apiClient.create( {
				name: componentName.trim(),
				content: componentContent.current,
			} );

			// Show success message using Elementor's dialog system
			( window as any ).elementorCommon.dialogsManager
				.createWidget( 'alert', {
					message: `Component saved successfully as: ${ componentName } (ID: ${ result.data.component_id })`,
				} )
				.show();

			resetAndClose();
		} catch ( error ) {
			console.error( 'Error saving component:', error );

			const errorMessage = error instanceof Error ? error.message : 'Failed to save component. Please try again.';
			( window as any ).elementorCommon.dialogsManager
				.createWidget( 'alert', {
					message: errorMessage,
				} )
				.show();
		} finally {
			setIsLoading( false );
		}
	};

	const resetAndClose = () => {
		setIsOpen( false );
		componentContent.current = [];
		setComponentName( '' );
		setAnchorPosition( null );
		setIsLoading( false );
	};

	if ( ! isOpen || ! componentContent.current ) {
		return null;
	}

	return (
		<ThemeProvider>
			<Popover
				open={ isOpen }
				onClose={ resetAndClose }
				anchorReference="anchorPosition"
				anchorPosition={ anchorPosition }
				anchorOrigin={ {
					vertical: 'top',
					horizontal: 'left',
				} }
				transformOrigin={ {
					vertical: 'top',
					horizontal: 'left',
				} }
				disablePortal
				disableScrollLock
			>
				<Stack alignItems="start" width="268px">
					<Stack direction="row" alignItems="center" sx={ { columnGap: 0.5, borderBottom: '1px solid', borderColor: 'divider', width: '100%', padding: 1, } }>
						<HeartHandShakeIcon fontSize={ FONT_SIZE } />
						<Typography variant="caption" sx={ { color: 'text.primary', fontWeight: '500' } }>
							{ __( 'Save as a component', 'elementor' ) }
						</Typography>
					</Stack>
					<Grid container gap={ 0.75 } alignItems="start" p={ 1.5 }>
						<Grid item xs={ 12 }>
							<FormLabel htmlFor={ 'component-name' } size="tiny">
								{ __( 'Name', 'elementor' ) }
							</FormLabel>
						</Grid>
						<Grid item xs={ 12 }>
							<TextField
								id={ 'component-name' }
								size={ FONT_SIZE }
								fullWidth
								value={ componentName }
								onChange={ ( e: React.ChangeEvent< HTMLInputElement > ) =>
									setComponentName( e.target.value )
								}
								inputProps={ { style: { color: 'text.primary', fontWeight: '600' } } }
							/>
						</Grid>
					</Grid>
					<Stack direction="row" justifyContent="flex-end" alignSelf="end" py={ 1.5 } px={ 1 }>
						<Button
							onClick={ resetAndClose }
							disabled={ isLoading }
							color="secondary"
							variant="text"
							size="small"
						>
							{ __( 'Cancel', 'elementor' ) }
						</Button>
						<Button
							onClick={ handleSave }
							disabled={ isLoading || ! componentName.trim() }
							variant="contained"
							color="primary"
							size="small"
						>
							{ isLoading ? __( 'Creating...', 'elementor' ) : __( 'Create', 'elementor' ) }
						</Button>
					</Stack>
				</Stack>
			</Popover>
		</ThemeProvider>
	);
}

const getComponentDefaultName = ( componentContent: ElementData[] ) => {
	const container = componentContent[0];
	const containerType = container.elType === 'widget' ? container.widgetType : container.elType;

	const widgetsCache = ( window as any ).elementor.widgetsCache;

	return containerType ? widgetsCache[ containerType ]?.title : '';
};
