import PropTypes from 'prop-types';
import LazyIconList from './icon-list';
import { Component } from 'react';
import Icon from './icon';

class Tab extends Component {
	componentDidMount = () => {
		if ( this.props.selected && this.props.selected.value ) {
			setTimeout( () => {
				const element = document.querySelector( '.elementor-selected' );
				if ( element ) {
					element.scrollIntoView( false );
				}
			}, 0 );
		}
	};

	getIconsOfType( type, icons ) {
		const { selected, filter } = this.props;
		return Object.entries( icons ).map( ( icon ) => {
			const iconData = icon[ 1 ],
				iconName = icon[ 0 ],
				className = iconData.displayPrefix + ' ' + iconData.selector;

			let containerClass = 'elementor-icons-manager__tab__item';
			if ( selected.value === className ) {
				containerClass += ' elementor-selected';
			}

			const key = containerClass + type + '-' + iconName + filter;

			return (
				<Icon
					key={ key }
					library={ type }
					keyID={ iconName }
					containerClass={ containerClass }
					className={ className }
					setSelectedHandler={ this.props.setSelected }
					data={ iconData }
				/>
			);
		} );
	}

	handleFullIconList = () => {
		let fullIconList = [];
		Object.entries( this.props.icons ).forEach( ( library ) => {
			if ( 'recommended' !== library[ 0 ] ) {
				fullIconList = [ ... fullIconList, ... this.getIconsOfType( library[ 0 ], library[ 1 ] ) ];
			}
		} );
		return fullIconList.sort( ( a, b ) => a.filter === b.filter ? 0 : +( a.filter > b.filter ) || -1 );
	};

	getLibrary = ( libraryName ) => {
		const icons = elementor.config.icons.libraries.filter( ( library ) => {
			return libraryName === library.name;
		} );
		return icons;
	};

	handleRecommendedList = () => {
		let recommendedIconList = [];
		Object.entries( this.props.icons ).forEach( ( library ) => {
			const iconLibrary = this.getLibrary( library[ 0 ] ),
				iconsOfType = iconLibrary[ 0 ].icons,
				recommendedIconsOfType = {};
			library[ 1 ].forEach( ( iconName ) => {
				if ( iconsOfType[ iconName ] ) {
					recommendedIconsOfType[ iconName ] = iconsOfType[ iconName ];
				}
			} );
			recommendedIconList = [ ... recommendedIconList, ...this.getIconsOfType( library[ 0 ], recommendedIconsOfType ) ];
		} );
		return recommendedIconList;
	};

	getIconsComponentList = () => {
		let iconsToShow = [];
		const { name, icons, filter } = this.props;
		switch ( name ) {
			case 'all':
				iconsToShow = this.handleFullIconList();
				break;
			case 'recommended':
				iconsToShow = this.handleRecommendedList();
				break;
			default:
				iconsToShow = this.getIconsOfType( name, icons );
				break;
		}

		if ( filter ) {
			iconsToShow = Object.values( iconsToShow ).filter( ( icon ) => {
				return icon.props.data.name.toLowerCase().indexOf( filter ) > -1;
			} );
		}
		return iconsToShow;
	};

	render = () => {
		const icons = this.getIconsComponentList();
		let selectedIndex = -1;
		for ( const [ index, icon ] of icons.entries() ) {
			if ( icon.props.containerClass.includes( 'elementor-selected' ) ) {
				selectedIndex = index;
				break;
			}
		}

		return (
			<LazyIconList
				selectedIndex={ selectedIndex }
				items={ icons }
				parentRef={ this.props.parentRef }
			/>
		);
	};
}

Tab.propTypes = {
	data: PropTypes.any,
	filter: PropTypes.any,
	icons: PropTypes.object,
	name: PropTypes.string,
	selected: PropTypes.object,
	setSelected: PropTypes.func,
	parentRef: PropTypes.any,
};

export default Tab;
