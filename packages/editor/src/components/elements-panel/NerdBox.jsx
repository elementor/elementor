import useConfig from "../../hooks/useConfig";

export const NerdBox = () => {
	const [assetsURL] = useConfig( 'assetsURL' );
	return (
		<div id="elementor-panel-get-pro-elements" className="elementor-nerd-box">
			<img alt="Go Pro" className="elementor-nerd-box-icon"
				 src={`${assetsURL}images/go-pro.svg` }/>
			<div className="elementor-nerd-box-message">Get more with Elementor Pro</div>
			<a className="elementor-button elementor-button-default elementor-nerd-box-link"
			   target="_blank" href="https://go.elementor.com/pro-widgets/" rel="noreferrer">Upgrade Now</a>
		</div>
	);
}
