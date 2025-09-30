import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { getElementLabel, type V1Element } from '@elementor/editor-elements';
import { ThemeProvider } from '@elementor/editor-ui';
import { StarIcon } from '@elementor/icons';
import { Alert, Button, FormLabel, Grid, Popover, Snackbar, Stack, TextField, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type CreateComponentResponse } from '../../api';
import { useComponents } from '../../hooks/use-components';
import { useCreateComponent } from '../../hooks/use-create-component';
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

	const { isPending } = useCreateComponent();

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

	const handleSave = async ( values: ComponentFormValues ) => {
		if ( ! element ) {
			throw new Error( `Can't save element as component: element not found` );
		}

		const tempId = Date.now();

		window.elementor.documents.addDocumentByConfig({
			id: tempId,
			type: 'elementor_component',
			elements: [ element.element.model.toJSON( { remove: [ 'default' ] } ) ],
			"container": "body",
			"post_type_title": "Component",
			"user": {
				"can_publish": true,
				"locked": false
			},
			revisions: {
				"enabled": true,
				"current_id": tempId
			},
			"settings": {
				"name": "page",
				"panelPage": {
					"title": values.componentName
				},
				"controls": {},
				"tabs": {
					"settings": "Settings"
				},
				"settings": {
					"post_title": values.componentName,
					"post_status": "publish"
				},
				"cssWrapperSelector": ""

			},
			"panel": {
				"title": "Component",
				"widgets_settings": [],
				"elements_categories": {
					"favorites": {
						"title": "Favorites",
						"icon": "eicon-heart",
						"sort": "a-z",
						"hideIfEmpty": false,
						"active": true
					},
					"v4-elements": {
						"title": "Atomic Elements",
						"hideIfEmpty": true,
						"active": true,
						"icon": "font"
					},
					"layout": {
						"title": "Layout",
						"hideIfEmpty": true,
						"active": true,
						"icon": "font"
					},
					"basic": {
						"title": "Basic",
						"icon": "eicon-font",
						"active": true
					},
					"pro-elements": {
						"title": "Pro",
						"active": true,
						"icon": "font"
					},
					"helloplus": {
						"title": "Hello+",
						"hideIfEmpty": true,
						"active": true,
						"icon": "font"
					},
					"general": {
						"title": "General",
						"icon": "eicon-font",
						"active": true
					},
					"link-in-bio": {
						"title": "Link In Bio",
						"hideIfEmpty": true,
						"active": true,
						"icon": "font"
					},
					"theme-elements": {
						"title": "Site",
						"active": false,
						"icon": "font"
					},
					"woocommerce-elements": {
						"title": "WooCommerce",
						"active": false,
						"icon": "font"
					},
					"unlimited_elements": {
						"title": "Unlimited Elements",
						"icon": "uc-default-widget-icon ue-wi-svg",
						"active": true
					},
					"uc_category_1": {
						"title": "Creative Widgets",
						"icon": "uc-default-widget-icon ue-wi-svg",
						"active": true
					},
					"wordpress": {
						"title": "WordPress",
						"icon": "eicon-wordpress",
						"active": false
					}
				},
				"default_route": "panel/elements/categories",
				"has_elements": true,
				"support_kit": false,
				"messages": {
					"publish_notification": "Hurray! Your Component is live."
				},
				"show_navigator": true,
				"allow_adding_widgets": true,
				"show_copy_and_share": false,
				"library_close_title": "Close",
				"publish_button_title": "Publish",
				"allow_closing_remote_library": true
			},
			"urls": {
				"exit_to_dashboard": "http://hackathon-2025.local/wp-admin/post.php?post=1&action=edit",
			},
			"remoteLibrary": {
				"type": "block",
				"default_route": "templates/blocks",
				"category": "elementor_component",
				"autoImportSettings": false
			},
			"status": {
				"value": "publish",
				"label": "Published"
			},
		});

		window.components.created.push( tempId );

		replaceElementWithComponent( element.element, {
			id: tempId,
			name: values.componentName,
		} );

		setResultNotification( {
			show: true,
			// Translators: %1$s: Component name, %2$s: Component ID
			message: __( 'Component saved successfully as: %1$s (ID: %2$s)', 'elementor' )
				.replace( '%1$s', values.componentName )
				.replace( '%2$s', tempId.toString() ),
			type: 'success',
		} );

		resetAndClosePopup();
	};

	const resetAndClosePopup = () => {
		setElement( null );
		setAnchorPosition( undefined );
	};

	return (
		<ThemeProvider>
			<Popover
				open={ element !== null }
				onClose={ resetAndClosePopup }
				anchorReference="anchorPosition"
				anchorPosition={ anchorPosition }
			>
				{ element !== null && (
					<Form
						initialValues={ { componentName: element.elementLabel } }
						handleSave={ handleSave }
						isSubmitting={ isPending }
						closePopup={ resetAndClosePopup }
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
	isSubmitting,
	closePopup,
}: {
	initialValues: ComponentFormValues;
	handleSave: ( values: ComponentFormValues ) => void;
	isSubmitting: boolean;
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
				<Button onClick={ closePopup } disabled={ isSubmitting } color="secondary" variant="text" size="small">
					{ __( 'Cancel', 'elementor' ) }
				</Button>
				<Button
					onClick={ handleSubmit }
					disabled={ isSubmitting || ! isValid }
					variant="contained"
					color="primary"
					size="small"
				>
					{ isSubmitting ? __( 'Creating…', 'elementor' ) : __( 'Create', 'elementor' ) }
				</Button>
			</Stack>
		</Stack>
	);
};
