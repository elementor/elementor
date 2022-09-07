import Grid from '../ui/grid/grid';
import HeaderButtons from './header-buttons';
import usePageTitle from 'elementor-app/hooks/use-page-title';

export default function Header( props ) {
	usePageTitle( { title: props.title } );

	let TitleTag = 'span',
		titleAttrs = {};

	if ( props.titleRedirectRoute ) {
		TitleTag = 'a';
		titleAttrs = {
			href: `#${ props.titleRedirectRoute }`,
			target: '_self',
		};
	}

	return (
		<Grid container alignItems="center" justify="space-between" className="eps-app__header">
			<TitleTag className="eps-app__logo-title-wrapper" { ...titleAttrs }>
				<i className="eps-app__logo eicon-elementor" />
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
	onClose: PropTypes.func,
};

Header.defaultProps = {
	buttons: [],
};
