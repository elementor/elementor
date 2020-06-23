import HeaderButtons from './header-buttons';

export default function Header( props ) {
	React.useEffect( () => {
		document.title = __( 'Elementor', 'elementor' ) + ' | ' + props.title;
	} );

	return (
		<header className="elementor-app__header dialog-header dialog-lightbox-header">
			<div className="elementor-templates-modal__header">
				<div className="elementor-templates-modal__header__logo-area">
					<div className="elementor-templates-modal__header__logo">
						<span className="elementor-templates-modal__header__logo__icon-wrapper elementor-gradient-logo">
							<i className="eicon-elementor" />
						</span>
						<span className="elementor-templates-modal__header__logo__title">
							{ props.title }
						</span>
					</div>
				</div>
				<HeaderButtons buttons={ props.buttons } />
			</div>
		</header>
	);
}

Header.propTypes = {
	title: PropTypes.string,
	buttons: PropTypes.arrayOf( PropTypes.object ),
};

Header.defaultProps = {
	buttons: [],
};
