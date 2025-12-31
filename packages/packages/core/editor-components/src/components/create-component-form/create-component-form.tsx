import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getElementLabel, type V1ElementData } from '@elementor/editor-elements';
import { notify } from '@elementor/editor-notifications';
import { Form as FormElement, ThemeProvider } from '@elementor/editor-ui';
import { StarIcon } from '@elementor/icons';
import { Alert, Button, FormLabel, Grid, Popover, Snackbar, Stack, TextField, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useComponents } from '../../hooks/use-components';
import { findNonAtomicElementsInElement } from '../../prevent-non-atomic-nesting';
import { createUnpublishedComponent } from '../../store/actions/create-unpublished-component';
import { type ComponentFormValues } from '../../types';
import { trackComponentEvent } from '../../utils/tracking';
import { useForm } from './hooks/use-form';
import { createBaseComponentSchema, createSubmitComponentSchema } from './utils/component-form-schema';
import {
	type ComponentEventData,
	type ContextMenuEventOptions,
	getComponentEventData,
} from './utils/get-component-event-data';

type SaveAsComponentEventData = {
	element: V1ElementData;
	anchorPosition: { top: number; left: number };
	options?: ContextMenuEventOptions;
};

type ResultNotification = {
	show: boolean;
	message: string;
	type: 'success' | 'error';
};

export function CreateComponentForm() {
	const [ element, setElement ] = useState< {
		element: V1ElementData;
		elementLabel: string;
	} | null >( null );

	const [ anchorPosition, setAnchorPosition ] = useState< { top: number; left: number } >();

	const [ resultNotification, setResultNotification ] = useState< ResultNotification | null >( null );

	const eventData = useRef< ComponentEventData | null >( null );

	useEffect( () => {
		const OPEN_SAVE_AS_COMPONENT_FORM_EVENT = 'elementor/editor/open-save-as-component-form';

		const openPopup = ( event: CustomEvent< SaveAsComponentEventData > ) => {
			const nonAtomicElements = findNonAtomicElementsInElement( event.detail.element );

			if ( nonAtomicElements.length > 0 ) {
				notify( {
					type: 'default',
					message: __(
						'Components require Atomic elements only. Remove Widgets to create this component.',
						'elementor'
					),
					id: 'non-atomic-element-save-blocked',
				} );
				return;
			}

			setElement( { element: event.detail.element, elementLabel: getElementLabel( event.detail.element.id ) } );
			setAnchorPosition( event.detail.anchorPosition );

			eventData.current = getComponentEventData( event.detail.element, event.detail.options );
			trackComponentEvent( {
				action: 'createClicked',
				...eventData.current,
			} );
		};

		window.addEventListener( OPEN_SAVE_AS_COMPONENT_FORM_EVENT, openPopup as EventListener );

		return () => {
			window.removeEventListener( OPEN_SAVE_AS_COMPONENT_FORM_EVENT, openPopup as EventListener );
		};
	}, [] );

	const handleSave = ( values: ComponentFormValues ) => {
		try {
			if ( ! element ) {
				throw new Error( `Can't save element as component: element not found` );
			}

			const uid = createUnpublishedComponent( values.componentName, element.element, eventData.current );

			setResultNotification( {
				show: true,
				// Translators: %1$s: Component name, %2$s: Component UID
				message: __( 'Component saved successfully as: %1$s (UID: %2$s)', 'elementor' )
					.replace( '%1$s', values.componentName )
					.replace( '%2$s', uid ),
				type: 'success',
			} );

			resetAndClosePopup();
		} catch {
			const errorMessage = __( 'Failed to save component. Please try again.', 'elementor' );
			setResultNotification( {
				show: true,
				message: errorMessage,
				type: 'error',
			} );
		}
	};

	const resetAndClosePopup = () => {
		setElement( null );
		setAnchorPosition( undefined );
	};

	const cancelSave = () => {
		resetAndClosePopup();

		trackComponentEvent( {
			action: 'createCancelled',
			...eventData.current,
		} );
	};

	return (
		<ThemeProvider>
			<Popover
				open={ element !== null }
				onClose={ cancelSave }
				anchorReference="anchorPosition"
				anchorPosition={ anchorPosition }
			>
				{ element !== null && (
					<Form
						initialValues={ { componentName: element.elementLabel } }
						handleSave={ handleSave }
						closePopup={ cancelSave }
					/>
				) }
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

const FONT_SIZE = 'tiny';

const Form = ( {
	initialValues,
	handleSave,
	closePopup,
}: {
	initialValues: ComponentFormValues;
	handleSave: ( values: ComponentFormValues ) => void;
	closePopup: () => void;
} ) => {
	const { values, errors, isValid, handleChange, validateForm } = useForm< ComponentFormValues >( initialValues );

	const { components } = useComponents();

	const existingComponentNames = useMemo( () => {
		return components?.map( ( component ) => component.name ) ?? [];
	}, [ components ] );

	const changeValidationSchema = useMemo(
		() => createBaseComponentSchema( existingComponentNames ),
		[ existingComponentNames ]
	);
	const submitValidationSchema = useMemo(
		() => createSubmitComponentSchema( existingComponentNames ),
		[ existingComponentNames ]
	);

	const handleSubmit = () => {
		const { success, parsedValues } = validateForm( submitValidationSchema );

		if ( success ) {
			handleSave( parsedValues );
		}
	};

	const texts = {
		heading: __( 'Save as a component', 'elementor' ),
		name: __( 'Name', 'elementor' ),
		cancel: __( 'Cancel', 'elementor' ),
		create: __( 'Create', 'elementor' ),
	};

	const nameInputId = 'component-name';

	return (
		<FormElement onSubmit={ handleSubmit }>
			<Stack alignItems="start" width="268px">
				<Stack
					direction="row"
					alignItems="center"
					py={ 1 }
					px={ 1.5 }
					sx={ { columnGap: 0.5, borderBottom: '1px solid', borderColor: 'divider', width: '100%' } }
				>
					<StarIcon fontSize={ FONT_SIZE } />
					<Typography variant="caption" sx={ { color: 'text.primary', fontWeight: '500', lineHeight: 1 } }>
						{ texts.heading }
					</Typography>
				</Stack>
				<Grid container gap={ 0.75 } alignItems="start" p={ 1.5 }>
					<Grid item xs={ 12 }>
						<FormLabel htmlFor={ nameInputId } size="tiny">
							{ texts.name }
						</FormLabel>
					</Grid>
					<Grid item xs={ 12 }>
						<TextField
							id={ nameInputId }
							size={ FONT_SIZE }
							fullWidth
							value={ values.componentName }
							onChange={ ( e: React.ChangeEvent< HTMLInputElement > ) =>
								handleChange( e, 'componentName', changeValidationSchema )
							}
							inputProps={ { style: { color: 'text.primary', fontWeight: '600' } } }
							error={ Boolean( errors.componentName ) }
							helperText={ errors.componentName }
						/>
					</Grid>
				</Grid>
				<Stack direction="row" justifyContent="flex-end" alignSelf="end" py={ 1 } px={ 1.5 }>
					<Button onClick={ closePopup } color="secondary" variant="text" size="small">
						{ texts.cancel }
					</Button>
					<Button type="submit" disabled={ ! isValid } variant="contained" color="primary" size="small">
						{ texts.create }
					</Button>
				</Stack>
			</Stack>
		</FormElement>
	);
};
