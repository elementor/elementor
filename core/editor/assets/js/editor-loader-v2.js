( function() {
	window.elementor.start();

	// Here should be all the loading logic for the editor v2.
	// THIS CODE SHOULD BE REMOVED
	ReactDOM.render(
		React.createElement(
			'div',
			{
				id: 'elementor-editor-v2-top-bar',
				style: {
					background: '#000',
					height: '50px',
					width: '100%',
				},
			},
			React.createElement(
				'img',
				{
					src: 'https://elementor.com/marketing/wp-content/uploads/2021/10/Elementor-Logo-Symbol-Red.png',
					style: {
						height: '90%',
						marginTop: '2px',
						marginLeft: '4px',
					},
				},
			),
		),
		document.getElementById( 'elementor-editor-wrapper-v2' ),
	);
	// UNTIL HERE
} )();
