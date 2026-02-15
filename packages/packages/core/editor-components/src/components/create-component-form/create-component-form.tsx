import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getElementLabel, type V1ElementData } from '@elementor/editor-elements';
import { type NotificationData, notify } from '@elementor/editor-notifications';
import { Form as FormElement, ThemeProvider, useTextFieldAutoSelect } from '@elementor/editor-ui';
import { ComponentsIcon } from '@elementor/icons';
import { __getState as getState } from '@elementor/store';
import { Button, FormLabel, Grid, Popover, Stack, TextField, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useComponents } from '../../hooks/use-components';
import { findNonAtomicElementsInElement } from '../../prevent-non-atomic-nesting';
import { createUnpublishedComponent } from '../../store/actions/create-unpublished-component';
import { selectComponentByUid } from '../../store/store';
import { type ComponentFormValues, type PublishedComponent } from '../../types';
import { switchToComponent } from '../../utils/switch-to-component';
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

const MAX_COMPONENTS = 100;

export function CreateComponentForm() {
	const [ element, setElement ] = useState< {
		element: V1ElementData;
		elementLabel: string;
	} | null >( null );

	const [ anchorPosition, setAnchorPosition ] = useState< { top: number; left: number } >();
	const { components } = useComponents();

	const eventData = useRef< ComponentEventData | null >( null );

	useEffect( () => {
		const OPEN_SAVE_AS_COMPONENT_FORM_EVENT = 'elementor/editor/open-save-as-component-form';

		const openPopup = ( event: CustomEvent< SaveAsComponentEventData > ) => {
			const { shouldOpen, notification } = shouldOpenForm( event.detail.element, components?.length ?? 0 );

			if ( ! shouldOpen ) {
				notify( notification );
				return;
			}

			setElement( { element: event.detail.element, elementLabel: getElementLabel( event.detail.element.id ) } );
			setAnchorPosition( event.detail.anchorPosition );

			eventData.current = getComponentEventData( event.detail.element, event.detail.options );
			trackComponentEvent( {
				action: 'createClicked',
				source: 'user',
				...eventData.current,
			} );
		};

		window.addEventListener( OPEN_SAVE_AS_COMPONENT_FORM_EVENT, openPopup as EventListener );

		return () => {
			window.removeEventListener( OPEN_SAVE_AS_COMPONENT_FORM_EVENT, openPopup as EventListener );
		};
	}, [ components?.length ] );

	const handleSave = async ( values: ComponentFormValues ) => {
		try {
			if ( ! element ) {
				throw new Error( `Can't save element as component: element not found` );
			}

			const { uid, instanceId } = await createUnpublishedComponent( {
				name: values.componentName,
				element: element.element,
				eventData: eventData.current,
				source: 'user',
			} );

			const publishedComponentId = ( selectComponentByUid( getState(), uid ) as PublishedComponent )?.id;

			if ( publishedComponentId ) {
				switchToComponent( publishedComponentId, instanceId );
			} else {
				throw new Error( 'Failed to find published component' );
			}

			notify( {
				type: 'success',
				message: __( 'Component created successfully.', 'elementor' ),
				id: `component-saved-successfully-${ uid }`,
			} );

			resetAndClosePopup();
		} catch {
			const errorMessage = __( 'Failed to create component. Please try again.', 'elementor' );
			notify( {
				type: 'error',
				message: errorMessage,
				id: 'component-save-failed',
			} );
			resetAndClosePopup();
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
			source: 'user',
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
				data-testid="create-component-form"
			>
				{ element !== null && (
					<Form
						initialValues={ { componentName: element.elementLabel } }
						handleSave={ handleSave }
						closePopup={ cancelSave }
					/>
				) }
			</Popover>
		</ThemeProvider>
	);
}

type ShouldOpenFormResult =
	| { shouldOpen: true; notification: null }
	| { shouldOpen: false; notification: NotificationData };

function shouldOpenForm( element: V1ElementData, componentsCount: number ): ShouldOpenFormResult {
	const nonAtomicElements = findNonAtomicElementsInElement( element );

	if ( nonAtomicElements.length > 0 ) {
		return {
			shouldOpen: false,
			notification: {
				type: 'default',
				message: __(
					'Components require atomic elements only. Remove widgets to create this component.',
					'elementor'
				),
				id: 'non-atomic-element-save-blocked',
			},
		};
	}

	if ( componentsCount >= MAX_COMPONENTS ) {
		return {
			shouldOpen: false,
			notification: {
				type: 'default',
				/* translators: %s is the maximum number of components */
				message: __(
					`You've reached the limit of %s components. Please remove an existing one to create a new component.`,
					'elementor'
				).replace( '%s', MAX_COMPONENTS.toString() ),
				id: 'maximum-number-of-components-exceeded',
			},
		};
	}

	return { shouldOpen: true, notification: null };
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
	const nameInputRef = useTextFieldAutoSelect();

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
		heading: __( 'Create component', 'elementor' ),
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
					<ComponentsIcon fontSize={ FONT_SIZE } />
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
							inputRef={ nameInputRef }
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
