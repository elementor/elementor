import { KitPluginsCustomizationDialog } from './components/kit-plugins-customization-dialog';
import { KitContentCustomizationDialog } from './components/kit-content-customization-dialog';
import { KitSettingsCustomizationDialog } from './components/kit-settings-customization-dialog';

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
		tooltipConfig: {
			message: __( 'This website template was exported with an older version of Elementor, so component editing is limited.', 'elementor' ),
			shouldShow: ( isImport, contextData, data ) => {
				// Check if this is an old export
				const isOldExport = contextData?.isOldExport === true;
				
				// Check if settings are disabled
				const isDisabled = isImport && contextData?.isOldExport && ! contextData?.data?.uploadedData?.manifest?.theme;
				if ( ! isDisabled ) {
					const fallbackDisabled = isImport && ! contextData?.data?.uploadedData?.manifest?.[ 'site-settings' ]?.theme;
					if ( ! fallbackDisabled ) {
						return false;
					}
				}
				
				// Check initial state
				const dataIncludes = contextData?.data?.includes?.includes( 'settings' );
				let initialState = dataIncludes;
				
				if ( isImport && ! contextData?.isOldExport && ! contextData?.data?.uploadedData?.manifest?.[ 'site-settings' ]?.theme ) {
					initialState = false;
				}
				
				if ( isImport && contextData?.isOldExport && ! contextData?.data?.uploadedData?.manifest?.theme ) {
					initialState = false;
				}
				
				return isOldExport && ( isDisabled || fallbackDisabled ) && initialState === false;
			},
		},
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
