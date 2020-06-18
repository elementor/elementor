import "./menu.scss";
import MenuItem from './menu-item';

export default function Menu( props ) {
	return (
		<nav className="e-app-menu">
			{ props.children }
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
	children: PropTypes.object,
};
