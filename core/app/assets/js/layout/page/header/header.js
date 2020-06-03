import HeaderButtons from './header-buttons';
import './header.scss';

export default function Header( props ) {
	React.useEffect( () => {
		document.title = __( 'Elementor', 'elementor' ) + ' | ' + props.title;
	} );

	return (
		<div className="e-app__view__header">
			<div className="e-app__view__header__logo-area">
				<div className="e-app__view__header__logo">
					<span className="e-app__view__header__logo__icon elementor-gradient-logo">
						<i className="eicon-elementor" />
					</span>
					<span className="e-app__view__header__logo__title">
						{ props.title }
					</span>
				</div>
			</div>
			<HeaderButtons buttons={ props.buttons } />
		</div>
	);
}

Header.propTypes = {
	title: PropTypes.string,
	buttons: PropTypes.arrayOf( PropTypes.object ),
};

Header.defaultProps = {
	buttons: [],
};
