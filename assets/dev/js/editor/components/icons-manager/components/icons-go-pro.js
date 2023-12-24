import { Component } from 'react';

class IconsGoPro extends Component {
	render = () => {
		return (
			<div id="elementor-icons-manager__promotion">
				<i id="elementor-icons-manager__promotion__icon" className="eicon-nerd"></i>
				<div id="elementor-icons-manager__promotion__text">{ __( 'Become a Pro user to upload unlimited font icon folders to your website.', 'elementor' ) }</div>
				<a
					href={ elementor.config.icons.goProURL }
					id="elementor-icons-manager__promotion__link"
					className="elementor-button go-pro"
					target="_blank"
					rel="noopener noreferrer"
				>{ __( 'Upgrade Now', 'elementor' ) }</a>
			</div>
		);
	};
}

export default IconsGoPro;
