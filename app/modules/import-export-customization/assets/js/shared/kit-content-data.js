import { KitPluginsCustomizationDialog } from './components/kit-plugins-customization-dialog';
import { KitContentCustomizationDialog } from './components/kit-content-customization-dialog';
import { KitSettingsCustomizationDialog } from './components/kit-settings-customization-dialog';
import { KitTemplatesCustomizationDialog } from './components/kit-templates-customization-dialog';
import { KIT_SECTIONS } from './constants';

const kitContentData = [
	{
		type: KIT_SECTIONS.CONTENT,
		data: {
			title: __( 'Content', 'elementor' ),
			features: {
				open: [
					__( 'Elementor Pages', 'elementor' ),
					__( 'Elementor Posts', 'elementor' ),
					__( 'WP Pages', 'elementor' ),
					__( 'WP Posts', 'elementor' ),
					__( 'WP Menus', 'elementor' ),
					__( 'Custom Post Types', 'elementor' ),
				],
			},
		},
		dialog: KitContentCustomizationDialog,
		required: false,
	},
	{
		type: KIT_SECTIONS.TEMPLATES,
		data: {
			title: __( 'Templates', 'elementor' ),
			features: {
				open: [
					__( 'Saved Templates', 'elementor' ),
				],
				locked: [
					__( 'Headers', 'elementor' ),
					__( 'Footers', 'elementor' ),
					__( 'Archives', 'elementor' ),
					__( 'Single Posts', 'elementor' ),
					__( 'Single Pages', 'elementor' ),
					__( 'Search Results', 'elementor' ),
					__( '404 Error Page', 'elementor' ),
					__( 'Popups', 'elementor' ),
					__( 'Global widgets', 'elementor' ),
				],
				tooltip: __( 'To import or export these components, you’ll need Elementor Pro.', 'elementor' ),
			},
		},
		dialog: KitTemplatesCustomizationDialog,
		required: false,
	},
	{
		type: KIT_SECTIONS.SETTINGS,
		data: {
			title: __( 'Settings & configurations', 'elementor' ),
			features: {
				open: [
					__( 'Classes', 'elementor' ),
					__( 'Default Styles', 'elementor' ),
					__( 'Variables', 'elementor' ),
					__( 'Global Colors', 'elementor' ),
					__( 'Global Fonts', 'elementor' ),
					__( 'Theme Style Settings', 'elementor' ),
					__( 'Layout Settings', 'elementor' ),
					__( 'Lightbox Settings', 'elementor' ),
					__( 'Background Settings', 'elementor' ),
					__( 'Custom Fonts', 'elementor' ),
					__( 'Icons', 'elementor' ),
					__( 'Code', 'elementor' ),
				],
			},
		},
		dialog: KitSettingsCustomizationDialog,
		required: false,
	},
	{
		type: KIT_SECTIONS.PLUGINS,
		data: {
			title: __( 'Plugins', 'elementor' ),
			features: {
				open: [
					__( 'All plugins are required for this website templates to work', 'elementor' ),
				],
			},
		},
		dialog: KitPluginsCustomizationDialog,
		required: true,
	},
];

export default kitContentData;
