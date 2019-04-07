import PropTypes from 'prop-types'
import {
	Component,
	Fragment,
	createRef
} from 'react';
//import Store from './../classes/store';
import Icon from './Icon';

class Tab extends Component {
	componentDidMount = () => {
		if ( this.props.selected && this.props.selected.value ) {
			setTimeout( () => {
				const element = document.querySelector( '.selected' );
				if ( element ) {
					element.scrollIntoView( false );
				}
			}, 0 );
		}
	};

	getIconsOfType( type, icons ) {
		const { selected } = this.props;
		return Object.entries( icons ).map( icon => {
			const iconData = icon[ 1 ],
				iconName = icon[ 0 ],
				className = iconData.displayPrefix + ' ' + iconData.selector,
				setter = {
					value: className,
					library: type,
				};
			let containerClass = 'icon--manager--list--item';
			if ( selected.value === className ) {
				containerClass += ' selected';
			}

			return (
				<Icon
					key={ type + '-' + iconName }
					library={ type }
					keyID={ iconName }
					containerClass={ containerClass }
					className={ className }
					setSelectedHandler={ () => this.props.setSelected( setter ) }
					data={ iconData }
				/>
			);
		} );
	}

	handleFullIconList = () => {
		let fullIconList = [];
		Object.entries( this.props.icons ).forEach( library => {
			fullIconList= [ ... fullIconList, ... this.getIconsOfType( library[ 0 ], library[ 1 ] ) ];
		} );
		return fullIconList.sort( ( a, b ) => a.filter === b.filter ? 0 : +( a.filter > b.filter ) || -1 );
	};

	getIconsComponentList = () => {
		let iconsToShow = [];
		const { name, icons, filter } = this.props;
		if ( 'all' === name ) {
			iconsToShow = this.handleFullIconList();
		} else {
			iconsToShow = this.getIconsOfType( name, icons );
		}
		if ( filter ) {
			iconsToShow = Object.values( iconsToShow ).filter( ( icon ) => {
				return icon.props.data.name.toLowerCase().indexOf( filter ) > -1;
			} );
		}
		return iconsToShow;
	};

	render = () => {
		return (
			<Fragment>
				{ this.getIconsComponentList() }
			</Fragment>
		);
	};
}

Tab.propTypes = {
  icons: PropTypes.object,
  name: PropTypes.string,
};

export default Tab;
