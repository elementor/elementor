import MenuItem from './menu-item';

export default function Menu( props ) {
	return (
		<nav className="elementor-app__site-editor__menu">
			<MenuItem id="all-parts" text={ __( 'All Parts', 'elementor' ) } icon="eicon-filter" url="/site-editor/templates" />
			<div className="elementor-app__site-editor__menu__items-title">
				{ __( 'Site Parts', 'elementor' ) }
			</div>
			{ (
				props.menuItems.map( ( item ) => (
					<MenuItem key={ item.type } text={ item.title } {...item } />
				) )
			) }
		</nav>
	);
}

Menu.propTypes = {
	menuItems: PropTypes.arrayOf( PropTypes.object ),
};
