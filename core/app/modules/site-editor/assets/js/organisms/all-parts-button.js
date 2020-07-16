import MenuItem from 'elementor-app/ui/menu/menu-item';

export default function AllPartsButton( props ) {
	return (
		<MenuItem
			id="all-parts"
			text={ __( 'All Parts', 'elementor' ) }
			className="eps-menu-item--active eps-menu-item__link"
			icon="eicon-filter"
			url={ props.url }
		/>
	);
}

AllPartsButton.propTypes = {
	url: PropTypes.string,
};
