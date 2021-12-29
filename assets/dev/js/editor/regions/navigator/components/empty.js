export function Empty() {
	return (
		<div className="elementor-nerd-box">
			<img className="elementor-nerd-box-icon" src={ `${ elementorCommon.config.urls.assets }images/information.svg` } />
			<div className="elementor-nerd-box-title">{ __( 'Easy Navigation is Here!', 'elementor' ) }</div>
			<div className="elementor-nerd-box-message">{ __( 'Once you fill your page with content, this window will give you an overview display of all the page elements. This way, you can easily move around any section, column, or widget.', 'elementor' ) }</div>
		</div>
	);
}

export default Empty;
