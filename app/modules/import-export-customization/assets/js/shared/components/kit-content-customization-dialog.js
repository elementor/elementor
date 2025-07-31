import { useState, useEffect } from 'react';
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

export function KitContentCustomizationDialog( {
	open,
	handleClose,
	handleSaveChanges,
	data,
} ) {
	const initialState = data.includes.includes( 'content' );
	const { isLoading: isPagesLoading, pageOptions } = usePages( { skipLoading: ! open } );
	const { isLoading: isTaxonomiesLoading, taxonomyOptions } = useTaxonomies( { skipLoading: ! open, exclude: [ 'nav_menu' ] } );
	const { customPostTypes } = useCustomPostTypes( { include: [ 'post' ] } );

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
		if ( ! isPagesLoading ) {
			setSettings( ( prevSettings ) => ( { ...prevSettings, pages: pageOptions.map( ( { value } ) => value ) } ) );
		}
	}, [ isPagesLoading, pageOptions ] );

	useEffect( () => {
		if ( ! isTaxonomiesLoading ) {
			setSettings( ( prevSettings ) => ( { ...prevSettings, taxonomies: taxonomyOptions.map( ( { value } ) => value ) } ) );
		}
	}, [ isTaxonomiesLoading, taxonomyOptions ] );

	useEffect( () => {
		if ( customPostTypes ) {
			setSettings( ( prevSettings ) => ( { ...prevSettings, customPostTypes: customPostTypes.map( ( { value } ) => value ) } ) );
		}
	}, [ customPostTypes ] );

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
			handleSaveChanges={ () => handleSaveChanges( 'content', settings ) }
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
							settingKey="content"
							title={ __( 'Site pages', 'elementor' ) }
							onSettingChange={ ( selectedPages ) => handleSettingsChange( 'pages', selectedPages ) }
							settings={ settings.pages }
							items={ pageOptions }
							loading={ isLoading }
						/>
						<SettingSection
							checked={ settings.menus }
							title={ __( 'Menus', 'elementor' ) }
							settingKey="menus"
							onSettingChange={ handleSettingsChange }
						/>

						{ customPostTypes.length > 0 && (
							<ListSettingSection
								settingKey="customPostTypes"
								title={ __( 'Custom post types', 'elementor' ) }
								onSettingChange={ ( selectedCustomPostTypes ) => handleSettingsChange( 'customPostTypes', selectedCustomPostTypes ) }
								settings={ settings.customPostTypes }
								items={ customPostTypes }
							/>
						) }

						<SettingSection
							checked={ settings.menus }
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
