const kitContentData = [
	{
		type: 'templates',
		data: {
			title: __( 'Global Templates', 'elementor' ),
			features: {
				open: [
					__( 'Saved Templates', 'elementor' ),
				],
				locked: [
					__( 'Site Parts', 'elementor' ),
					__( 'Popups', 'elementor' ),
					__( 'Global Widgets', 'elementor' ),
				],
			},
			notice: __( 'Site Parts, Global widgets and Popups will are available only when Elementor Pro license is Connected', 'elementor' ),
		},
	},
	{
		type: 'settings',
		data: {
			title: __( 'Global Styles And Settings', 'elementor' ),
			description: __( 'Theme Style, Global Colors and Typography, Layout, Lightbox and Site Identity settings', 'elementor' ),
		},
	},
	{
		type: 'content',
		data: {
			title: __( 'Content', 'elementor' ),
			description: __( 'Published pages, posts, related taxonomies, menu and custom post types.', 'elementor' ),
		},
	},
];

export default kitContentData;
