import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getElementLabel, type V1Element } from '@elementor/editor-elements';
import { ThemeProvider } from '@elementor/editor-ui';
import { StarIcon } from '@elementor/icons';
import { Alert, Button, FormLabel, Grid, Popover, Snackbar, Stack, TextField, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type CreateComponentResponse } from '../api';
import { useComponents } from '../hooks/use-components';
import { type FormErrors, type FormValues } from '../types';
import { saveElementAsComponent } from '../utils/save-element-as-component';
import { validateComponentForm } from '../utils/validate-component-form';

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
const POPOVER_WIDTH = '268px';
const OPEN_SAVE_AS_COMPONENT_FORM_EVENT = 'elementor/editor/open-save-as-component-form';

const initialValues: FormValues = {
	componentName: '',
};

export function CreateComponentForm() {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ isLoading, setIsLoading ] = useState( false );

	const [ values, setValues ] = useState< FormValues >( initialValues );
	const [ errors, setErrors ] = useState< FormErrors >( {} );

	const [ anchorPosition, setAnchorPosition ] = useState< { top: number; left: number } >();
	const [ resultNotification, setResultNotification ] = useState< ResultNotification | null >( null );

	const { data: components } = useComponents();

	const element = useRef< V1Element | null >( null );

	const isValid = useMemo( () => {
		return Object.values( errors ).every( ( error ) => ! error );
	}, [ errors ] );

	const existingComponentNames = useMemo( () => {
		return components?.map( ( component ) => component.name ) ?? [];
	}, [ components ] );

	const openPopup = useCallback( ( event: CustomEvent< SaveAsComponentEventData > ) => {
		element.current = event.detail.element;
		setValues( { componentName: getElementLabel( event.detail.element.id ) } );
		setAnchorPosition( event.detail.anchorPosition );

		setIsOpen( true );
	}, [] );

	useEffect( () => {
		window.addEventListener( OPEN_SAVE_AS_COMPONENT_FORM_EVENT, openPopup as EventListener );

		return () => {
			window.removeEventListener( OPEN_SAVE_AS_COMPONENT_FORM_EVENT, openPopup as EventListener );
		};
	}, [ openPopup ] );

	const handleChange = ( e: React.ChangeEvent< HTMLInputElement >, field: keyof FormValues ) => {
		const updated = { ...values, [ field ]: e.target.value };
		setValues( updated );

		const { success, errors: validationErrors } = validateComponentForm(
			updated,
			existingComponentNames,
			'change'
		);

		if ( ! success ) {
			setErrors( validationErrors );
		} else {
			setErrors( {} );
		}
	};

	const handleSave = async () => {
		if ( ! element.current ) {
			return;
		}

		const {
			success,
			parsedValues,
			errors: validationErrors,
		} = validateComponentForm( values, existingComponentNames, 'submit' );

		if ( ! success ) {
			setErrors( validationErrors );
			return;
		}

		setIsLoading( true );

		await saveElementAsComponent( element.current, parsedValues.componentName, {
			onSuccess: ( result: CreateComponentResponse ) => {
				setResultNotification( {
					show: true,
					// Translators: %1$s: Component name, %2$s: Component ID
					message: __( 'Component saved successfully as: %1$s (ID: %2$s)', 'elementor' )
						.replace( '%1$s', parsedValues.componentName )
						.replace( '%2$s', result.component_id.toString() ),
					type: 'success',
				} );

				resetAndClosePopup();
			},
			onError: () => {
				const errorMessage = __( 'Failed to save component. Please try again.', 'elementor' );
				setResultNotification( {
					show: true,
					message: errorMessage,
					type: 'error',
				} );
			},
		} );

		setIsLoading( false );
	};

	const resetAndClosePopup = () => {
		setIsOpen( false );
		element.current = null;
		setValues( initialValues );
		setErrors( {} );
		setAnchorPosition( undefined );
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
				<Stack alignItems="start" width={ POPOVER_WIDTH }>
					<Stack
						direction="row"
						alignItems="center"
						py={ 1 }
						px={ 1.5 }
						sx={ { columnGap: 0.5, borderBottom: '1px solid', borderColor: 'divider', width: '100%' } }
					>
						<StarIcon fontSize={ FONT_SIZE } />
						<Typography
							variant="caption"
							sx={ { color: 'text.primary', fontWeight: '500', lineHeight: 1 } }
						>
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
								value={ values.componentName }
								onChange={ ( e: React.ChangeEvent< HTMLInputElement > ) =>
									handleChange( e, 'componentName' )
								}
								inputProps={ { style: { color: 'text.primary', fontWeight: '600' } } }
								error={ Boolean( errors.componentName ) }
								helperText={ errors.componentName }
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
							disabled={ isLoading || ! isValid }
							variant="contained"
							color="primary"
							size="small"
						>
							{ isLoading ? __( 'Creating…', 'elementor' ) : __( 'Create', 'elementor' ) }
						</Button>
					</Stack>
				</Stack>
			</Popover>
			<Snackbar open={ resultNotification?.show } onClose={ () => setResultNotification( null ) }>
				<Alert
					onClose={ () => setResultNotification( null ) }
					severity={ resultNotification?.type }
					sx={ { width: '100%' } }
				>
					{ resultNotification?.message }
				</Alert>
			</Snackbar>
		</ThemeProvider>
	);
}
