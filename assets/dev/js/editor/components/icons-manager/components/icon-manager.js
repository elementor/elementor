import { Component } from 'react';
import {
	render,
	unmountComponentAtNode,
} from 'react-dom'
import Tab from './tab';
import IconLibrary from './../classes/icon-library';
import Store from './../classes/store';
//import iconTabs from './../classes/icon-tabs-config';

class IconsManager extends Component {
	state = {
		activeTab: '',
		selected: {
			type: '',
			value: '',
		},
		iconTabs: elementor.config.icons,
		loaded: {},
		filter: '',
	};

	cache = {};

	componentDidMount = () => {
		const loaded = {};
		this.state.iconTabs.forEach( ( tab, index ) => {
			loaded[ tab.name ] = false;
		} );
		this.setState( { loaded: loaded } );
	};

	componentWillUnmount = () => {
		unmountComponentAtNode( this.props.containerElement );
		document.body.removeChild( this.props.containerElement );
	};

	loadAllTabs = () => {
		const { loaded, iconTabs } = this.state;
		iconTabs.forEach( ( tabSettings, index ) => {
			if ( loaded[ tabSettings.name ] ) {
				return;
			}
			IconLibrary.initIconType( tabSettings, ( library ) => {
				loaded[ tabSettings.name ] = true;
				this.cache[ library.name ] = library;
			} );
		} );
		this.updateLoaded( 'all' );
	};

	getActiveTab = () => {
		let { activeTab, loaded, iconTabs } = this.state;
		if ( ! activeTab ) {
			if ( this.props.activeTab ) {
				activeTab = this.props.activeTab;
			} else {
				activeTab = iconTabs[ 0 ].name;
			}
			return this.setState( { activeTab: activeTab });
		}

		const tabSettings = {
			... iconTabs.filter( tab => tab.name === activeTab )[ 0 ],
		};
		if ( loaded[ activeTab ] ) {
			return { ... tabSettings };
		}

		if ( 'all' === tabSettings.name && ! loaded[ 'all' ] ) {
			return this.loadAllTabs();
		}

		IconLibrary.initIconType( tabSettings, ( library ) => {
			this.updateLoaded( activeTab );
			this.cache[ library.name ] = library;
		} );
		return false;
	};

	updateLoaded( libraryName ) {
		const { loaded } = this.state;
		loaded[ libraryName ] = true;
		this.setState( { loaded: loaded } );
	}

	getIconTabsLinks = () => {
		return this.state.iconTabs.map( ( tab, index ) => {
			const isCurrentTab = tab.name === this.state.activeTab,
				className = [ 'icon--manager--tab--link' ];

			if ( isCurrentTab ) {
				className.push( 'active' );
			}

			return (
				<span
					className={ className.join( ' ' ) }
					key={  tab.name }
					onClick={ () => {
						if ( isCurrentTab ) {
							return;
						}
						this.setState( { activeTab: tab.name } );
					} }>
					{ tab.label }
				</span>
			);
		} );
	};

	getActiveTabIcons = activeTab => {
		if ( this.cache.hasOwnProperty( activeTab ) ) {
			return this.cache[ activeTab ].icons;
		}

		if ( 'all' === activeTab.name ) {
			const icons = {};
			this.state.iconTabs.forEach( ( tabSettings, index ) => {
				if ( 'all' === tabSettings.name ) {
					return;
				}
				icons[ tabSettings.name ] = Store.getIcons( tabSettings );
			} );
			return icons;
		}
		return Store.getIcons( activeTab );
	};

	handleSearch = ( event ) => {
		let filter = event.target.value;

		if ( filter && '' !== filter ) {
			filter = filter.toLocaleLowerCase();
			if ( this.state.filter === filter ) {
				return;
			}
		} else {
			filter = '';
		}
		this.setState( { filter: filter } );
	};

	setSelected = ( selected ) => {
		this.setState( { selected: selected } );
	};

	render = () => {
		const {
			showSearch = true,
			include = [],
			exclude = [],
		} = this.props;
		const { filter } = this.state;
		const activeTab = this.getActiveTab();
		let selected = this.state.selected;
		if ( '' === selected.value && this.props.selected && this.props.selected.value) {
			selected = { value: this.props.selected.value, type: this.props.selected.library };
		}
		if ( activeTab ) {
			activeTab.icons = this.getActiveTabIcons( activeTab );
		}
		return (
			<div className={ 'icons-manager--wrapper' }>
				<div className={ 'icons-manager--sidebar' }>
					<div className={ 'icons-manager--tab-links' }>
						{ this.getIconTabsLinks() }
					</div>
				</div>
				<div className={ 'icons-manager--main' }>
					{ showSearch ? (
						<div className={ 'icons-manager--search' }>
							<input
								type={ 'search' }
								placeholder={ 'Search...' }
								onInput={ this.handleSearch }
							/>
						</div> ) : ''
					}
					<div className={ 'icons-manager--tab__container' }>
						<input type="hidden" name="icon_value" id="icon_value" value={ selected.value } />
						<input type="hidden" name="icon_type" id="icon_type" value={ selected.type } />
						{ activeTab ? (
							<Tab
								setSelected={ this.setSelected }
								selected={ selected }
								filter={ filter }
								key={ activeTab.name }
								{ ... activeTab } />
						) : (
							'Loading'
						) }
					</div>
				</div>
			</div>
		);
	};
}

export default IconsManager;

const renderIconManager = function ( props ) {
	const containerElement = document.querySelector( '#elementor--icon--manager--placeholder' );

	return render( <IconsManager
			{ ... props }
			containerElement={ containerElement } />,
		containerElement
	);
};

export { renderIconManager };
