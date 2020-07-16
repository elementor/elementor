import './menu.scss';
import Button from '../molecules/button';
import { Match } from '@reach/router';

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
					<Match key={ item.type } path={ 'templates/header' }>
						{ ( match ) => {
							console.log( match );
							return (
							<li key={item.type} className={`e-app-menu-item${match ? ' active' : ''}`}>
								<Button text={item.title} className="e-app-menu-item__link" {...item} />
								<ActionButton {...item} />
							</li> );
						} }
					</Match>
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
