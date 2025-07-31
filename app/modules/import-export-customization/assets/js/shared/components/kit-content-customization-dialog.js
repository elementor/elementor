import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Stack, CircularProgress } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { KitCustomizationDialog } from './kit-customization-dialog';
import { ListSettingSection } from './customization-list-setting-section';
import { SettingSection } from './customization-setting-section';
import { SubSetting } from './customization-sub-setting';
import { usePages } from '../hooks/use-pages';
import { useCustomPostTypes } from '../hooks/use-custom-post-types';
import { useTaxonomies } from '../hooks/use-taxonomies';
import { CenteredContent } from './layout';
import { AppsEventTracking } from 'elementor-app/event-track/apps-event-tracking';

export function KitContentCustomizationDialog( {
	open,
	handleClose,
	handleSaveChanges,
	data,
} ) {
	const initialState = data.includes.includes( 'content' );
	const { isLoading: isPagesLoading, pageOptions, isLoaded: isPagesLoaded } = usePages( { skipLoading: ! open } );
	const { isLoading: isTaxonomiesLoading, taxonomyOptions, isLoaded: isTaxonomiesLoaded } = useTaxonomies( { skipLoading: ! open, exclude: [ 'nav_menu' ] } );
	const { customPostTypes } = useCustomPostTypes( { include: [ 'post' ] } );
	const unselectedValues = useRef( data.analytics?.customization?.content || [] );

	const [ settings, setSettings ] = useState( () => {
		if ( data.customization.content ) {
			return data.customization.content;
		}

		return {
			pages: [],
			menus: initialState,
			taxonomies: [],
			customPostTypes: [],
		};
	} );

	useEffect( () => {
		if ( isPagesLoaded ) {
			setSettings( ( prevSettings ) => ( {
				...prevSettings,
				pages: data.customization.content?.pages || pageOptions.map( ( { value } ) => value ),
			} ) );
		}
	}, [ isPagesLoaded, pageOptions, data.customization.content?.pages ] );

	useEffect( () => {
		if ( isTaxonomiesLoaded ) {
			setSettings( ( prevSettings ) => ( {
				...prevSettings,
				taxonomies: data.customization.content?.taxonomies || taxonomyOptions.map( ( { value } ) => value ),
			} ) );
		}
	}, [ isTaxonomiesLoaded, taxonomyOptions, data.customization.content?.taxonomies ] );

	useEffect( () => {
		if ( customPostTypes ) {
			setSettings( ( prevSettings ) => ( {
				...prevSettings,
				customPostTypes: data.customization.content?.customPostTypes || customPostTypes.map( ( { value } ) => value ),
			} ) );
		}
	}, [ customPostTypes, data.customization.content?.customPostTypes ] );

	useEffect( () => {
		if ( open ) {
			setSettings( ( prevState ) => {
				if ( ! data.includes.includes( 'content' ) ) {
					return {
						pages: [],
						menus: false,
						taxonomies: [],
						customPostTypes: [],
					};
				}

				return prevState;
			} );
		}
	}, [ open, data, setSettings ] );

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
						<ListSettingSection
							settingKey="pages"
							title={ __( 'Site pages', 'elementor' ) }
							onSettingChange={ ( selectedPages ) => {
								const isAllselected = selectedPages.length === pageOptions.length;
								unselectedValues.current = isAllselected
									? unselectedValues.current = unselectedValues.current.filter( ( val ) => 'pages' !== val )
									: [ ...unselectedValues.current, 'pages' ];

								handleSettingsChange( 'pages', selectedPages );
							} }
							settings={ settings.pages }
							items={ pageOptions }
							loading={ isLoading }
						/>
						<SettingSection
							checked={ settings.menus }
							title={ __( 'Menus', 'elementor' ) }
							settingKey="menus"
							onSettingChange={ ( key, isChecked ) => {
								unselectedValues.current = isChecked
									? unselectedValues.current.filter( ( value ) => value !== key )
									: [ ...unselectedValues.current, key ];

								handleSettingsChange( key, isChecked );
							} }
						/>

						{ customPostTypes.length > 0 && (
							<ListSettingSection
								settingKey="customPostTypes"
								title={ __( 'Custom post types', 'elementor' ) }
								onSettingChange={ ( selectedCustomPostTypes ) => {
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
								} }
								settings={ settings.customPostTypes }
								items={ customPostTypes }
							/>
						) }

						<SettingSection
							description={ __( 'Group your content by type, topic, or any structure you choose.', 'elementor' ) }
							title={ __( 'Taxonomies', 'elementor' ) }
							settingKey="taxonomies"
							hasToggle={ false }
						>
							{ taxonomyOptions.map( ( taxonomy ) => {
								return (
									<SubSetting
										key={ taxonomy.value }
										label={ taxonomy.label }
										settingKey="taxonomies"
										checked={ settings.taxonomies.includes( taxonomy.value ) }
										onSettingChange={ ( key, isChecked ) => {
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
										} }
									/>
								);
							} ) }
						</SettingSection>
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
