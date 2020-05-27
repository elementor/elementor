import Button from './header-button';

export default function HeaderButtons( props ) {
	let tools = '';

	if ( props.buttons.length ) {
		const buttons = props.buttons.map( ( button ) => {
			return <Button key={ button.id } {...button } />;
		} );

		tools = (
			<div id="elementor-template-library-header-tools">
				<div id="elementor-template-library-header-actions">
					{ buttons }
				</div>
			</div>
		);
	}

	return (
		<div className="elementor-templates-modal__header__items-area">
			<Button
				id="close"
				text={ __( 'Close', 'elementor' ) }
				icon="eicon-close"
				className="elementor-templates-modal__header__close--normal"
				onClick={ () => {
					// Directly.
					if ( window.top === window ) {
						history.back();
					} else {
						// Iframe.
						window.top.elementorAppLoader.closeApp();
					}
				} }
			/>
			{ tools }
		</div>
	);
}

HeaderButtons.propTypes = {
	buttons: PropTypes.arrayOf( PropTypes.object ),
};
