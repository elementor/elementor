import React, { useEffect } from 'react';

const height = '50px';

export const TopBar = () => {
	useEffect( () => {
		document.body.style.setProperty( '--e-editor-v2-top-bar-height', height );

		return () => {
			document.body.style.removeProperty( '--e-editor-v2-top-bar-height' );
		};
	}, [] );

	return (
		<div style={ {
			background: '#000',
			height,
			width: '100%',
		} }>
			<img
				alt="Elementor Logo"
				src="https://elementor.com/marketing/wp-content/uploads/2021/10/Elementor-Logo-Symbol-Red.png"
				style={ {
					height: '90%',
					marginTop: '2px',
					marginLeft: '4px',
				} }
			/>
		</div>
	);
};

export default TopBar;
