import BaseHeaderButtons from 'elementor-app/layout/header-buttons';

export default function HeaderButtons( props ) {
	return (
		<div style={ { flex: 1 } }>
			<BaseHeaderButtons buttons={ props.buttons }/>
		</div>
	);
}

HeaderButtons.propTypes = {
	buttons: PropTypes.arrayOf( PropTypes.object ),
};
