import { Grid } from '@elementor/app-ui';
import HeaderButtons from '../../../../../../assets/js/layout/header-buttons';

export default function Header( props ) {
	const onClose = () => {
		window.top.location = elementorAppConfig.admin_url;
	};

	return (
		<Grid container alignItems="center" justify="space-between" className="eps-app__header">
			{ props.startColumn || <a
				className="eps-app__logo-title-wrapper"
				href="#/kit-library"
			>
				<i className="eps-app__logo eicon-elementor" />
				<h1 className="eps-app__title">{ __( 'Website Templates', 'elementor' ) }</h1>
			</a> }
			{ props.centerColumn || <span /> }
			{ props.endColumn || <div style={ { flex: 1 } }>
				<HeaderButtons buttons={ props.buttons } onClose={ onClose } />
			</div> }
		</Grid>
	);
}

Header.propTypes = {
	startColumn: PropTypes.node,
	endColumn: PropTypes.node,
	centerColumn: PropTypes.node,
	buttons: PropTypes.arrayOf( PropTypes.object ),
	kitName: PropTypes.string,
	pageId: PropTypes.string,
};
