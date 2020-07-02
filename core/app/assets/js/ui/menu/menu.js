import './menu.scss';
import Button from '../molecules/button';

export default function Menu( props ) {
	const ActionButton = ( itemProps ) => {
		if ( ! props.actionButton ) {
			return '';
		}

		return props.actionButton( itemProps );
	};

	return (
		<nav className="e-app-menu">
			<ul>
			{ props.children }
			{ (
				props.menuItems.map( ( item ) => (
					<li key={ item.type } className="e-app-menu-item">
						<Button text={ item.title } className="e-app-menu-item__link" {...item } />
						<ActionButton {...item }/>
					</li>
				) )
			) }
			</ul>
		</nav>
	);
}

Menu.propTypes = {
	menuItems: PropTypes.arrayOf( PropTypes.object ),
	children: PropTypes.object,
	actionButton: PropTypes.func,
};
