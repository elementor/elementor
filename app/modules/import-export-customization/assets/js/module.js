import router from '@elementor/router';

import Export from './export';
import Import from './import';
import { CustomizationFreePromotion } from './shared/components/customization-free-promotion';
import { ListSettingSection } from './shared/components/customization-list-setting-section';
import { SubSetting } from './shared/components/customization-sub-setting';
import { SettingSection } from './shared/components/customization-setting-section';

export default class ImportExportCustomization {
	routes = [
		{
			path: '/export-customization/*',
			component: Export,
		},
		{
			path: '/import-customization/*',
			component: Import,
		},
	];

	constructor() {
		for ( const route of this.routes ) {
			router.addRoute( route );
		}

		this.registerImportExportTemplate();
		this.registerImportExportSiteSettings();
		this.registerImportExportContent();

		window.dispatchEvent( new CustomEvent( 'elementor/import-export-customization/sections-registered' ) );
	}

	registerImportExportTemplate() {
		if ( ! elementorCommon?.config?.experimentalFeatures?.[ 'import-export-customization' ] ) {
			return;
		}

		elementorModules?.importExport?.templateRegistry.register( {
			key: 'siteTemplates',
			exportGroup: 'site-templates',
			title: __( 'Site Templates', 'elementor ' ),
			order: 0,
			getInitialState: elementorModules?.importExport?.createGetInitialState?.( 'site-templates' ),
		} );
	}

	registerImportExportSiteSettings() {
		if ( ! elementorCommon?.config?.experimentalFeatures?.[ 'import-export-customization' ] ) {
			return;
		}

		const sections = [
			{
				key: 'promotion',
				title: __( 'Customization is not available for this kit.', 'elementor' ),
				component: CustomizationFreePromotion,
				order: 0,
			},
			{
				key: 'theme',
				title: __( 'Theme', 'elementor' ),
				description: __( 'Only public WordPress themes are supported', 'elementor' ),
				isDisabled: () => true,
				order: 10,
			},
			{
				key: 'siteSettings',
				title: __( 'Site settings', 'elementor' ),
				order: 20,
				children: [
					{
						key: 'globalColors',
						title: __( 'Global colors', 'elementor' ),
						isDisabled: () => true,
						order: 10,
					},
					{
						key: 'globalFonts',
						title: __( 'Global fonts', 'elementor' ),
						isDisabled: () => true,
						order: 20,
					},
					{
						key: 'themeStyleSettings',
						title: __( 'Theme style settings', 'elementor' ),
						isDisabled: () => true,
						order: 30,
					},
				],
			},
			{
				key: 'generalSettings',
				title: __( 'Settings', 'elementor' ),
				description: __( 'Include site identity, background, layout, Lightbox, page transitions, and custom CSS', 'elementor' ),
				isDisabled: () => true,
				order: 30,
			},
			{
				key: 'experiments',
				title: __( 'Experiments', 'elementor' ),
				description: __( 'This will apply all experiments that are still active during import', 'elementor' ),
				isDisabled: () => true,
				order: 40,
			},
		];

		sections.forEach( ( section ) => {
			elementorModules?.importExport?.siteSettingsRegistry.register( section );
		} );
	}

	registerImportExportContent() {
		if ( ! elementorCommon?.config?.experimentalFeatures?.[ 'import-export-customization' ] ) {
			return;
		}

		const sections = [
			{
				key: 'pages',
				title: __( 'Pages', 'elementor' ),
				description: __( 'Only public WordPress themes are supported', 'elementor' ),
				order: 10,
				isDisabled: () => true,
				getInitialState: () => [],
				component: ( { settingKey, title, onChange, settings, options, isLoading, disabled } ) => {
					if ( ! options.length ) {
						return null;
					}

					return (
						<ListSettingSection
							settingKey={ settingKey }
							title={ title }
							onSettingChange={ onChange }
							settings={ settings.pages }
							items={ options }
							loading={ isLoading }
							disabled={ disabled }
						/>
					);
				},
			},
			{
				key: 'menus',
				isDisabled: () => true,
				title: __( 'Menus', 'elementor' ),
				order: 20,
			},
			{
				key: 'customPostTypes',
				title: __( 'Custom post types', 'elementor' ),
				getInitialState: () => [],
				description: __( 'Include site identity, background, layout, Lightbox, page transitions, and custom CSS', 'elementor' ),
				isDisabled: () => false,
				component: ( { settingKey, title, onChange, settings, options, disabled } ) => {
					if ( ! options.length ) {
						return null;
					}

					return (
						<ListSettingSection
							settingKey={ settingKey }
							title={ title }
							onSettingChange={ onChange }
							settings={ settings.customPostTypes }
							items={ options }
							disabled={ disabled }
						/>
					);
				},
				order: 30,
			},
			{
				key: 'taxonomies',
				title: __( 'Taxonomies', 'elementor' ),
				description: __( 'Group your content by type, topic, or any structure you choose.', 'elementor' ),
				order: 40,
				getInitialState: () => [],
				isDisabled: () => true,
				component: ( { options, settings, onChange, description, title, settingKey, disabled } ) => {
					return (
						<SettingSection
							description={ description }
							title={ title }
							settingKey={ settingKey }
							hasToggle={ false }
						>
							{ options.map( ( option ) => {
								return (
									<SubSetting
										disabled={ disabled }
										key={ option.value }
										label={ option.label }
										settingKey="taxonomies"
										checked={ disabled ? true : settings.taxonomies.includes( option.value ) }
										onSettingChange={ ( _, isChecked ) => {
											onChange( option, isChecked );
										} }
									/>
								);
							} ) }
						</SettingSection>
					);
				},
			},
		];

		sections.forEach( ( section ) => {
			elementorModules?.importExport?.contentRegistry.register( section );
		} );
	}
}
