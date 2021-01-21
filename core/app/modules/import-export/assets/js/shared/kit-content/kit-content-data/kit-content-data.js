const kitContentData = [
	{
		type: 'templates',
		data: {
			title: __( 'Theme Builder & Templates', 'elementor' ),
			features: {
				open: [
					__( 'Saved Templates', 'elementor' ),
					__( 'Landing Pages', 'elementor' ),
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
				],
			},
		},
	},
	{
		type: 'content',
		data: {
			title: __( 'Content', 'elementor' ),
			description: __( 'Elementor Pages', 'elementor' ),
		},
	},
	{
		type: 'settings',
		data: {
			title: __( 'Site Settings', 'elementor' ),
			description: __( 'Global Colors, Global  Typography, Theme Style settings, Layout Settings, Lightbox Settings, Background Settings', 'elementor' ),
		},
	},
];

export default kitContentData;
