import Button from './header-button';
import './header-buttons.scss';

export default function HeaderButtons( props ) {
	let tools = '';

	if ( props.buttons.length ) {
		const buttons = props.buttons.map( ( button ) => {
			return <Button className="e-app__view__header__buttons__button-action" key={ button.id } {...button } />;
		} );

		tools = (
			<div id="e-app__view__header__actions">
				{ buttons }
			</div>
		);
	}

	return (
		<div className="e-app__view__header__buttons">
			<Button
				id="close"
				text={ __( 'Close', 'elementor' ) }
				icon="eicon-close"
				className="e-app__view__header__buttons__button-close--normal"
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
