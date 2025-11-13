import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { getElementLabel, type V1Element, type V1ElementData } from '@elementor/editor-elements';
import { ThemeProvider } from '@elementor/editor-ui';
import { StarIcon } from '@elementor/icons';
import { __useDispatch as useDispatch } from '@elementor/store';
import { Alert, Button, FormLabel, Grid, Popover, Snackbar, Stack, TextField, Typography } from '@elementor/ui';
import { generateUniqueId } from '@elementor/utils';
import { __ } from '@wordpress/i18n';

import { useComponents } from '../../hooks/use-components';
import { slice } from '../../store/store';
import { type ComponentFormValues } from '../../types';
import { useForm } from './hooks/use-form';
import { createBaseComponentSchema, createSubmitComponentSchema } from './utils/component-form-schema';
import { replaceElementWithComponent } from './utils/replace-element-with-component';

type SaveAsComponentEventData = {
	element: V1Element;
	anchorPosition: { top: number; left: number };
};

type ResultNotification = {
	show: boolean;
	message: string;
	type: 'success' | 'error';
};

export function CreateComponentForm() {
	const [ element, setElement ] = useState< {
		element: V1Element;
		elementLabel: string;
	} | null >( null );

	const [ anchorPosition, setAnchorPosition ] = useState< { top: number; left: number } >();

	const [ resultNotification, setResultNotification ] = useState< ResultNotification | null >( null );

	const dispatch = useDispatch();

	useEffect( () => {
		const OPEN_SAVE_AS_COMPONENT_FORM_EVENT = 'elementor/editor/open-save-as-component-form';

		const openPopup = ( event: CustomEvent< SaveAsComponentEventData > ) => {
			setElement( { element: event.detail.element, elementLabel: getElementLabel( event.detail.element.id ) } );
			setAnchorPosition( event.detail.anchorPosition );
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

			const uid = generateUniqueId( 'component' );

			dispatch(
				slice.actions.addUnpublished( {
					uid,
					name: values.componentName,
					elements: [ element.element.model.toJSON( { remove: [ 'default' ] } ) as V1ElementData ],
				} )
			);

			dispatch( slice.actions.addCreatedThisSession( uid ) );

			replaceElementWithComponent( element.element, { uid, name: values.componentName } );

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

	return (
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
					{ __( 'Cancel', 'elementor' ) }
				</Button>
				<Button
					onClick={ handleSubmit }
					disabled={ ! isValid }
					variant="contained"
					color="primary"
					size="small"
				>
					{ __( 'Create', 'elementor' ) }
				</Button>
			</Stack>
		</Stack>
	);
};
