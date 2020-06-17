import "./menu.scss";
import MenuItem from './menu-item';

export default function Menu( props ) {
	return (
		<nav className="e-app-menu">
			<MenuItem id="all-parts" text={ __( 'All Parts', 'elementor' ) } className="e-app-menu-item--active" icon="eicon-filter" url="/site-editor/templates" />
			<div className="e-app-menu__title u-mt-44 u-mb-16">
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
