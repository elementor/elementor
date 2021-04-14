import { Grid } from '@elementor/app-ui';
import HeaderButtons from '../../../../../../assets/js/layout/header-buttons';

export default function Header( props ) {
	return (
		<Grid container alignItems="center" justify="space-between" className="eps-app__header">
			{ props.startSlot || <a className="eps-app__logo-title-wrapper" href="#/kit-library">
				<i className="eps-app__logo eicon-elementor"/>
				<h1 className="eps-app__title">{ __( 'Kit Library', 'elementor' ) }</h1>
			</a> }
			{ props.centerSlot || <span/> }
			{ props.endSlot || <div style={ { flex: 1 } }>
				<HeaderButtons buttons={ props.buttons }/>
			</div> }
		</Grid>
	);
}

Header.propTypes = {
	startSlot: PropTypes.node,
	endSlot: PropTypes.node,
	centerSlot: PropTypes.node,
	buttons: PropTypes.arrayOf( PropTypes.object ),
};
