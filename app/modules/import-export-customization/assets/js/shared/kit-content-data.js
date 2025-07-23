import { KitSettingsCustomizationDialog } from './components/kit-settings-customization-dialog';
import { KitPluginsCustomizationDialog } from './components/kit-plugins-customization-dialog';
import { KitContentCustomizationDialog } from './components/kit-content-customization-dialog';

const kitContentData = [
	{
		type: 'content',
		data: {
			title: __( 'Content', 'elementor' ),
			features: {
				open: [
					__( 'Elementor Pages', 'elementor' ),
					__( 'Landing Pages', 'elementor' ),
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
		type: 'templates',
		data: {
			title: __( 'Templates', 'elementor' ),
			features: {
				open: [
					__( 'Saved Templates', 'elementor' ),
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
			},
		},
		dialog: null,
		required: false,
	},
	{
		type: 'settings',
		data: {
			title: __( 'Settings & configurations', 'elementor' ),
			features: {
				open: [
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
		type: 'plugins',
		data: {
			title: __( 'Plugins', 'elementor' ),
			features: {
				open: [
					__( 'All plugins are required for this website templates work', 'elementor' ),
				],
			},
		},
		dialog: KitPluginsCustomizationDialog,
		required: true,
	},
];

export default kitContentData;
