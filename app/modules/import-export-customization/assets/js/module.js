import router from '@elementor/router';

import Export from './export';
import Import from './import';
import {siteSettingsRegistry} from "./shared/registry/site-settings";

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
	}

	registerImportExportTemplate() {
		if ( ! elementorCommon?.config?.experimentalFeatures?.[ 'import-export-customization' ] ) {
			return;
		}

		elementorModules?.importExport?.templateRegistry.register( {
			key: 'siteTemplates',
			exportGroup: 'site-templates',
			title: __( 'Site Templates', 'elementor '),
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
				key: 'theme',
				title: __( 'Theme', 'elementor' ),
				description: __( 'Only public WordPress themes are supported', 'elementor' ),
				order: 0,
			},
			{
				key: 'siteSettings',
				title: __( 'Site settings', 'elementor' ),
				order: 1,
				children: [
					{
						key: 'globalColors',
						title: __( 'Global colors', 'elementor' ),
						order: 0,
					},
					{
						key: 'globalFonts',
						title: __( 'Global fonts', 'elementor' ),
						order: 1,
					},
					{
						key: 'themeStyleSettings',
						title: __( 'Theme style settingss', 'elementor' ),
						order: 2,
					},
				],
			},
			{
				key: 'generalSettings',
				title: __( 'Settings', 'elementor' ),
				description: __( 'Include site identity, background, layout, Lightbox, page transitions, and custom CSS', 'elementor' ),
				order: 2,
			},
			{
				key: 'experiments',
				title: __( 'Experiments', 'elementor' ),
				description: __( 'This will apply all experiments that are still active during import', 'elementor' ),
				order: 3,
			},
		];

		sections.forEach( ( section ) => {
			elementorModules?.importExport?.siteSettingsRegistry.register( section );
		} );
	}
}
