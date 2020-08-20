import HeaderButtons from './header-buttons';
import Grid from '../ui/grid/grid';

export default function Header( props ) {
	const TitleTag = props.titleRedirectRoute ? 'a' : 'span',
		titleAttrs = { href: props.titleRedirectRoute ? `#${ props.titleRedirectRoute }` : null };

	React.useEffect( () => {
		document.title = __( 'Elementor', 'elementor' ) + ' | ' + props.title;
	} );

	return (
		<Grid container alignItems="center" justify="space-between" className="eps-app__header">
			<TitleTag className="eps-app__logo-title-wrapper" { ...titleAttrs }>
				<i className="eps-app__logo eicon-elementor"/>
				<h1 className="eps-app__title">{ props.title }</h1>
			</TitleTag>
			<HeaderButtons buttons={ props.buttons } />
		</Grid>
	);
}

Header.propTypes = {
	title: PropTypes.string,
	titleRedirectRoute: PropTypes.string,
	buttons: PropTypes.arrayOf( PropTypes.object ),
};

Header.defaultProps = {
	buttons: [],
};
