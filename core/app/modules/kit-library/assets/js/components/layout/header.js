import { Grid } from '@elementor/app-ui';
import HeaderButtons from '../../../../../../assets/js/layout/header-buttons';
import { eventTrackingDispatch } from 'elementor-app/event-track/events';

export default function Header( props ) {
	const onClose = () => {
		eventTrackingDispatch(
			'kit-library/close',
			{
				kit_name: props.kitName,
				view_type_clicked: props.pageId,
				source: props.pageId,
				event: 'top bar close kit library',
			},
		);

		window.top.location = elementorAppConfig.admin_url;
	},
		onLogoClick = () => eventTrackingDispatch(
			'kit-library/logo',
			{
				event: 'top panel logo',
				source: 'home page',
			},
		);

	return (
		<Grid container alignItems="center" justify="space-between" className="eps-app__header">
			{ props.startColumn || <a
				className="eps-app__logo-title-wrapper"
				href="#/kit-library"
				onClick={ () => onLogoClick() }
			>
				<i className="eps-app__logo eicon-elementor" />
				<h1 className="eps-app__title">{ __( 'Kit Library', 'elementor' ) }</h1>
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
