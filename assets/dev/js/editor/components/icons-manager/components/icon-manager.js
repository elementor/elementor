import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { render } from 'react-dom';
import Tab from './tab';

class IconsManager extends Component {
	state = {
		activeTab: this.props.activeTab,
		selected: {
			library: '',
			value: '',
		},
		iconTabs: elementor.config.icons,
		loaded: this.props.loaded,
		filter: '',
	};

	cache = {};

	loadAllTabs = () => {
		const { loaded } = this.state;
		const { icons } = this.props;
		icons.forEach( ( tabSettings ) => {
			if ( loaded[ tabSettings.name ] ) {
				return;
			}
			if ( -1 < [ 'all', 'recommended' ].indexOf( tabSettings.name ) ) {
				return;
			}

			elementor.iconManager.library.initIconType( { ... tabSettings }, ( library ) => {
				this.cache[ library.name ] = library;
				loaded[ tabSettings.name ] = true;
			} );
		} );

		loaded.all = true;
		loaded.recommended = true;
		this.setState( {
			loaded: loaded,
		} );
	};

	getActiveTab = () => {
		let { activeTab } = this.state;
		const {	loaded } = this.state,
			{ icons } = this.props;

		if ( ! activeTab ) {
			if ( this.props.activeTab ) {
				activeTab = this.props.activeTab;
			}
		}
		if ( ! loaded[ activeTab ] ) {
			return false;
		}

		const tabSettings = {
			... icons.filter( ( tab ) => tab.name === activeTab )[ 0 ],
		};
		if ( loaded[ activeTab ] ) {
			return { ... tabSettings };
		}

		if ( 'all' === tabSettings.name && ! loaded.all ) {
			return this.loadAllTabs();
		}

		elementor.iconManager.library.initIconType( { ... tabSettings }, ( library ) => {
			this.cache[ library.name ] = library;
			this.updateLoaded( library.name );
		} );
		return false;
	};

	updateLoaded( libraryName ) {
		const { loaded } = this.state;
		loaded[ libraryName ] = true;
		this.setState( { loaded: loaded } );
	}

	getIconTabsLinks = () => {
		return this.props.icons.map( ( tab ) => {
			const isCurrentTab = tab.name === this.state.activeTab;

			let className = 'elementor-icons-manager__tab-link';

			if ( isCurrentTab ) {
				className += ' elementor-active';
			}

			return (
				<div
					className={ className }
					key={ tab.name }
					onClick={ () => {
						if ( isCurrentTab ) {
							return;
						}
						this.setState( { activeTab: tab.name } );
					} }>
					<i className={ tab.labelIcon }></i>
					{ tab.label }
				</div>
			);
		} );
	};

	getActiveTabIcons = ( activeTab ) => {
		if ( activeTab.name ) {
			return this.getActiveTabIcons( activeTab.name );
		}

		if ( this.cache[ activeTab ] ) {
			return this.cache[ activeTab ].icons;
		}

		if ( 'recommended' === activeTab ) {
			return this.state.iconTabs[ 0 ].icons;
		}

		if ( 'all' === activeTab ) {
			return this.getAllIcons();
		}

		if ( ! this.state.loaded[ activeTab ] ) {
			const librarySettings = this.props.icons.filter( ( library ) => activeTab === library.name );
			return elementor.iconManager.library.initIconType( { ... librarySettings[ 0 ] }, ( library ) => {
				this.cache[ library.name ] = library;
				this.updateLoaded( library.name );
			} );
		}

		return elementor.iconManager.store.getIcons( activeTab );
	};

	getAllIcons = () => {
		if ( this.cache.all ) {
			return this.cache.all.icons;
		}

		const icons = {};
		this.props.icons.forEach( ( tabSettings ) => {
			if ( 'all' === tabSettings.name || 'recommended' === tabSettings.name ) {
				return;
			}
			icons[ tabSettings.name ] = this.getActiveTabIcons( tabSettings.name );
		} );
		this.cache.all = { icons: icons };
		return icons;
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
		elementor.iconManager.setSettings( 'selectedIcon', selected );

		this.setState( { selected: selected } );
	};

	getSelected = () => {
		let { selected } = this.state;
		if ( '' === selected.value && this.props.selected && this.props.selected.value ) {
			selected = { value: this.props.selected.value, library: this.props.selected.library };
		}
		return selected;
	};

	render = () => {
		const activeTab = this.getActiveTab(),
			activeTabName = ( activeTab.name ) ? activeTab.name : activeTab;
		const {	showSearch = true } = this.props,
			{ filter } = this.state,
			selected = this.getSelected();

		if ( ! activeTabName || ! this.state.loaded[ activeTabName ] ) {
			return 'Loading';
		}

		if ( activeTab ) {
			activeTab.icons = this.getActiveTabIcons( activeTab );
		}

		return (
			<Fragment>
				<div id="elementor-icons-manager__sidebar">
					<div id="elementor-icons-manager__tab-links">
						{ this.getIconTabsLinks() }
					</div>
				</div>
				<div id="elementor-icons-manager__main">
					{ showSearch ? (
						<div id="elementor-icons-manager__search">
							<input placeholder={ 'Filter by name...' } onInput={ this.handleSearch }/>
							<i className={ 'eicon-search' }></i>
						</div> ) : ''
					}
					<div id="elementor-icons-manager__tab__wrapper">
						<div id="elementor-icons-manager__tab__title">{ activeTab.label }</div>
						<div id="elementor-icons-manager__tab__content">
							<input type="hidden" name="icon_value" id="icon_value" value={ selected.value } />
							<input type="hidden" name="icon_type" id="icon_type" value={ selected.library } />
							{ this.state.loaded[ activeTab.name ] ? (
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
			</Fragment>
		);
	};
}

export default IconsManager;

const renderIconManager = function( props ) {
	const containerElement = document.querySelector( '#elementor-icons-manager-modal .dialog-content' );

	return render( <IconsManager
			{ ... props }
			containerElement={ containerElement } />,
		containerElement
	);
};
export { renderIconManager };

IconsManager.propTypes = {
	activeTab: PropTypes.any,
	icons: PropTypes.any,
	loaded: PropTypes.any,
	modalView: PropTypes.any,
	recommended: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ),
	selected: PropTypes.any,
	showSearch: PropTypes.bool,
};
