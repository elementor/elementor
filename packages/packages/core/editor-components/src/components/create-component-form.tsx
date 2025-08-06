import * as React from 'react';
import { ThemeProvider } from '@elementor/editor-ui';
import { HeartHandShakeIcon } from '@elementor/icons';
import {
	Alert,
	Button,
	FormLabel,
	Grid,
	Popover,
	Snackbar,
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

type Response = {
	show: boolean;
	message: string;
	type: 'success' | 'error';
};

const FONT_SIZE = 'tiny';
const OPEN_SAVE_AS_COMPONENT_POPUP_EVENT = 'elementor/editor/open-save-as-component-form';

export function CreateComponentForm() {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ isLoading, setIsLoading ] = useState( false );

	const [ componentName, setComponentName ] = useState( '' );
	const [ anchorPosition, setAnchorPosition ] = useState<{ top: number; left: number } | null>( null );

	const [ response, setResponse ] = useState<Response | null>( null );

	const componentContent = useRef<ElementData[]>( [] );

	useEffect( () => {
		window.addEventListener(OPEN_SAVE_AS_COMPONENT_POPUP_EVENT,openPopup as EventListener);

		return () => {
			window.removeEventListener(OPEN_SAVE_AS_COMPONENT_POPUP_EVENT,openPopup as EventListener);
		};
	}, [] );

	const openPopup = ( event: CustomEvent< SaveAsComponentEventData > ) => {
		if ( ! event.detail.componentContent ) {
			console.error( 'No component content' );

			setResponse( {
				show: true,
				message: 'Failed to save component. Please try again.',
				type: 'error',
			} );
			return;
		};

		componentContent.current = event.detail.componentContent;
		setComponentName( getComponentDefaultName( event.detail.componentContent ) );
		setAnchorPosition( event.detail.anchorPosition );

		setIsOpen( true );
	};

	const resetAndClosePopup = () => {
		setIsOpen( false );
		componentContent.current = [];
		setComponentName( '' );
		setAnchorPosition( null );
		setIsLoading( false );
	};

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

			setResponse( {
				show: true,
				message: `Component saved successfully as: ${ componentName } (ID: ${ result.data.component_id })`,
				type: 'success',
			} );

			resetAndClosePopup();
		} catch ( error ) {
			console.error( 'Error saving component:', error );

			const errorMessage = error instanceof Error ? error.message : 'Failed to save component. Please try again.';
			setResponse( {
				show: true,
				message: errorMessage,
				type: 'error',
			} );
		} finally {
			setIsLoading( false );
		}
	};

	return (
		<ThemeProvider>
			<Popover
				open={ isOpen }
				onClose={ resetAndClosePopup }
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
							onClick={ resetAndClosePopup }
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
			<Snackbar open={ response?.show } onClose={ () => setResponse( null ) }>
				<Alert onClose={ () => setResponse( null ) } severity={ response?.type } sx={ { width: '100%' } }>
					{ response?.message }
				</Alert>
			</Snackbar>
		</ThemeProvider>
	);
}

const getComponentDefaultName = ( componentContent: ElementData[] ) => {
	const container = componentContent[0];
	const containerType = container.elType === 'widget' ? container.widgetType : container.elType;

	const widgetsCache = ( window as any ).elementor.widgetsCache;

	return containerType ? widgetsCache[ containerType ]?.title : '';
};
