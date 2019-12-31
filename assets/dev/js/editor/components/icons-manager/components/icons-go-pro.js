import { Component } from 'react';

class IconsGoPro extends Component {
	render = () => {
		return (
			<div id="elementor-icons-manager__promotion">
				<i id="elementor-icons-manager__promotion__icon" className="eicon-nerd"></i>
				<div id="elementor-icons-manager__promotion__text">{ elementor.translate( 'icons_promotion' ) }</div>
				<a
					href={ elementor.config.icons.goProURL }
					id="elementor-icons-manager__promotion__link"
					className="elementor-button elementor-button-default elementor-button-go-pro"
					target="_blank"
					rel="noopener noreferrer"
				>{ elementor.translate( 'go_pro' ) }</a>
			</div>
		);
	};
}

export default IconsGoPro;
