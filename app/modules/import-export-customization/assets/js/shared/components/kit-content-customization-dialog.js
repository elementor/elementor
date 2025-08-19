import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Stack, CircularProgress } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { KitCustomizationDialog } from './kit-customization-dialog';
import { SettingSection } from './customization-setting-section';
import { CenteredContent } from './layout';
import { AppsEventTracking } from 'elementor-app/event-track/apps-event-tracking';
import { useKitCustomizationPages } from '../hooks/use-kit-customization-pages';
import { useKitCustomizationTaxonomies } from '../hooks/use-kit-customization-taxonomies';
import { useKitCustomizationCustomPostTypes } from '../hooks/use-kit-customization-custom-post-types';

export function KitContentCustomizationDialog( {
	open,
	handleClose,
	handleSaveChanges,
	data,
} ) {
	const isImport = data.hasOwnProperty( 'uploadedData' );

	const contentRegistry = elementorModules?.importExport?.contentRegistry;
	const contentSections = contentRegistry?.getAll() || [];

	const initialState = data.includes.includes( 'content' );
	const unselectedValues = useRef( data.analytics?.customization?.content || [] );

	const { isLoading: isPagesLoading, pageOptions, isLoaded: isPagesLoaded } = useKitCustomizationPages( { open, data } );
	const { isLoading: isTaxonomiesLoading, taxonomyOptions, isLoaded: isTaxonomiesLoaded } = useKitCustomizationTaxonomies( { open, data } );
	const { customPostTypes } = useKitCustomizationCustomPostTypes( { data } );

	const [ settings, setSettings ] = useState( () => {
		if ( data.customization.content ) {
			return data.customization.content;
		}

		return contentRegistry.getState( data, initialState );
	} );

	useEffect( () => {
		if ( isPagesLoaded || isImport ) {
			setSettings( ( prevSettings ) => ( {
				...prevSettings,
				pages: data.customization.content?.pages || pageOptions.map( ( { value } ) => value ),
			} ) );
		}
	}, [ isPagesLoaded, pageOptions, data.customization.content?.pages, isImport ] );

	useEffect( () => {
		if ( isTaxonomiesLoaded || isImport ) {
			setSettings( ( prevSettings ) => ( {
				...prevSettings,
				taxonomies: data.customization.content?.taxonomies || taxonomyOptions.map( ( { value } ) => value ),
			} ) );
		}
	}, [ isTaxonomiesLoaded, taxonomyOptions, data.customization.content?.taxonomies, isImport ] );

	useEffect( () => {
		if ( customPostTypes ) {
			setSettings( ( prevSettings ) => ( {
				...prevSettings,
				customPostTypes: data.customization.content?.customPostTypes || customPostTypes.map( ( { value } ) => value ),
			} ) );
		}
	}, [ customPostTypes, data.customization.content?.customPostTypes ] );

	useEffect( () => {
		AppsEventTracking.sendPageViewsWebsiteTemplates( elementorCommon.eventsManager.config.secondaryLocations.kitLibrary.kitExportCustomizationEdit );
	}, [] );

	const handleSettingsChange = ( settingKey, payload ) => {
		setSettings( ( prev ) => ( {
			...prev,
			[ settingKey ]: payload,
		} ) );
	};

	const isLoading = isPagesLoading || isTaxonomiesLoading;

	const getHandleChange = ( section ) => {
		if ( 'pages' === section.key ) {
			return ( selectedPages ) => {
				const isAllselected = selectedPages.length === pageOptions.length;
				unselectedValues.current = isAllselected
					? unselectedValues.current = unselectedValues.current.filter( ( val ) => 'pages' !== val )
					: [ ...unselectedValues.current, 'pages' ];

				handleSettingsChange( 'pages', selectedPages );
			};
		}

		if ( 'taxonomies' === section.key ) {
			return ( taxonomy, isChecked ) => {
				unselectedValues.current = isChecked
					? unselectedValues.current.filter( ( val ) => taxonomy.value !== val )
					: [ ...unselectedValues.current, taxonomy.value ];

				setSettings( ( prevState ) => {
					const selectedTaxonomies = isChecked
						? [ ...prevState.taxonomies, taxonomy.value ]
						: prevState.taxonomies.filter( ( value ) => value !== taxonomy.value );

					return {
						...prevState,
						taxonomies: selectedTaxonomies,
					};
				} );
			};
		}

		if ( 'customPostTypes' === section.key ) {
			return ( selectedCustomPostTypes ) => {
				const filteredUnselectedValues = unselectedValues.current.filter( ( value ) => ! customPostTypes.includes( value ) );
				const isAllChecked = selectedCustomPostTypes.length === customPostTypes.length;

				unselectedValues.current = isAllChecked
					? filteredUnselectedValues.filter( ( value ) => value !== 'customPostTypes' )
					: [
						...filteredUnselectedValues,
						...customPostTypes.filter( ( cpt ) => ! selectedCustomPostTypes.includes( cpt ) ).map( ( { value } ) => value ),
						'customPostTypes',
					];
				handleSettingsChange( 'customPostTypes', selectedCustomPostTypes );
			};
		}

		if ( 'menus' === section.key ) {
			return ( key, isChecked ) => {
				unselectedValues.current = isChecked
					? unselectedValues.current.filter( ( value ) => value !== key )
					: [ ...unselectedValues.current, key ];

				handleSettingsChange( key, isChecked );
			};
		}

		return () => {};
	}

	const getSectionItems = ( section ) => {
		if ( 'pages' === section.key ) {
			return pageOptions;
		}

		if ( 'taxonomies' === section.key ) {
			return taxonomyOptions;
		}

		if ( 'customPostTypes' === section.key ) {
			return customPostTypes;
		}
	}

	return (
		<KitCustomizationDialog
			open={ open }
			title={ __( 'Edit content', 'elementor' ) }
			handleClose={ handleClose }
			handleSaveChanges={ () => handleSaveChanges( 'content', settings, unselectedValues.current ) }
		>
			{ isLoading
				? (
					<CenteredContent>
						<CircularProgress size={ 30 } />
					</CenteredContent>
				)
				: (
					<Stack>
						{ contentSections.map( ( section ) => {
							if ( section.component ) {
								return (
									<section.component
										key={ section.key }
										settingKey={ section.key }
										title={ section.title }
										description={ section.description }
										onChange={ getHandleChange( 'pages' ) }
										options={ getSectionItems( section ) }
										settings={ settings }
										isLoading={ isLoading }
										disabled={ section.isDisabled( data ) }
									/>
								);
							}
							return (
								<SettingSection
									key={ section.key }
									checked={ settings[ section.key ] }
									title={ section.title }
									description={ section.description }
									settingKey={ section.key }
									onSettingChange={ getHandleChange( section ) }
									disabled={ section.isDisabled() }
								/>
							);
						} ) }
					</Stack>
				)
			}
		</KitCustomizationDialog>
	);
}

KitContentCustomizationDialog.propTypes = {
	open: PropTypes.bool.isRequired,
	handleClose: PropTypes.func.isRequired,
	handleSaveChanges: PropTypes.func.isRequired,
	data: PropTypes.object.isRequired,
};
