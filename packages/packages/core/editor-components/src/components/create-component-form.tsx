import * as React from 'react';
import { ThemeProvider } from '@elementor/editor-ui';
import { StarFilledIcon } from '@elementor/icons';
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

import { ComponentCreateResponse } from '../api';
import { useEffect, useRef, useState } from 'react';
import { getElementLabel, V1Element } from '@elementor/editor-elements';
import { saveElementAsComponent } from '../utils/save-element-as-component';

type SaveAsComponentEventData = {
	element: V1Element;
	anchorPosition: { top: number; left: number };
};

type ResultNotification = {
	show: boolean;
	message: string;
	type: 'success' | 'error';
};

const FONT_SIZE = 'tiny';
const OPEN_SAVE_AS_COMPONENT_FORM_EVENT = 'elementor/editor/open-save-as-component-form';

export function CreateComponentForm() {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ isLoading, setIsLoading ] = useState( false );

	const [ componentName, setComponentName ] = useState( '' );
	const [ anchorPosition, setAnchorPosition ] = useState<{ top: number; left: number } | null>( null );

	const [ resultNotification, setResultNotification ] = useState<ResultNotification | null>( null );

	const element = useRef<V1Element | null>( null );

	useEffect( () => {
		window.addEventListener(OPEN_SAVE_AS_COMPONENT_FORM_EVENT,openPopup as EventListener);

		return () => {
			window.removeEventListener(OPEN_SAVE_AS_COMPONENT_FORM_EVENT,openPopup as EventListener);
		};
	}, [] );

	const openPopup = ( event: CustomEvent< SaveAsComponentEventData > ) => {
		element.current = event.detail.element;
		setComponentName( getElementLabel( event.detail.element.id ) );
		setAnchorPosition( event.detail.anchorPosition );

		setIsOpen( true );
	};

	const resetAndClosePopup = () => {
		setIsOpen( false );
		element.current = null;
		setComponentName( '' );
		setAnchorPosition( null );
		setIsLoading( false );
	};

	const handleSave = async () => {
		if ( ! element.current || ! componentName.trim() ) {
			return;
		}

		setIsLoading( true );

		await saveElementAsComponent( element.current, componentName.trim(), {
			onSuccess: ( result: ComponentCreateResponse ) => {
				setResultNotification( {
					show: true,
					message: `Component saved successfully as: ${ componentName } (ID: ${ result.component_id })`,
					type: 'success',
				} );

				resetAndClosePopup();
			},
			onError: ( error: any ) => {
				const errorMessage = error instanceof Error ? error.message : 'Failed to save component. Please try again.';
				setResultNotification( {
					show: true,
					message: errorMessage,
					type: 'error',
				} );
			},
		} );

		setIsLoading( false );
	};

	return (
		<ThemeProvider>
			<Popover
				open={ isOpen }
				onClose={ resetAndClosePopup }
				anchorReference="anchorPosition"
				anchorPosition={ anchorPosition }
			>
				<Stack alignItems="start" width="268px">
					<Stack direction="row" alignItems="center" py={ 1 } px={ 1.5 } sx={ { columnGap: 0.5, borderBottom: '1px solid', borderColor: 'divider', width: '100%' } }>
						<StarFilledIcon fontSize={ FONT_SIZE } />
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
					<Stack direction="row" justifyContent="flex-end" alignSelf="end" py={ 1 } px={ 1.5 }>
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
			<Snackbar open={ resultNotification?.show } onClose={ () => setResultNotification( null ) }>
				<Alert onClose={ () => setResultNotification( null ) } severity={ resultNotification?.type } sx={ { width: '100%' } }>
					{ resultNotification?.message }
				</Alert>
			</Snackbar>
		</ThemeProvider>
	);
}
