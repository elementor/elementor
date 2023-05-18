import PropTypes from 'prop-types';
import {
	Component,
	Fragment,
	createRef,
} from 'react';
import { render } from 'react-dom';
import Tab from './tab';
import IconsGoPro from './icons-go-pro';

class IconsManager extends Component {
	scrollViewRef = createRef();
	state = {
		activeTab: this.props.activeTab,
		selected: {
			library: '',
			value: '',
		},
		iconTabs: elementor.config.icons.libraries,
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
			loaded,
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
		if ( 'GoPro' === activeTab ) {
			return activeTab;
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
		this.setState( { loaded } );
	}

	isNativeTab( tab ) {
		return ( 'all' === tab.name || 'recommended' === tab.name || 'fa-' === tab.name.substr( 0, 3 ) ) && tab.native;
	}

	getIconTabsLinks = ( native = true ) => {
		return this.props.icons.map( ( tab ) => {
			if ( native ^ this.isNativeTab( tab ) ) {
				return '';
			}

			const isCurrentTab = tab.name === this.state.activeTab;

			let className = 'elementor-icons-manager__tab-link';

			if ( isCurrentTab ) {
				className += ' elementor-active';
			}

			return (
				// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
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
		this.cache.all = { icons };
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
		this.setState( { filter } );
	};

	setSelected = ( selected ) => {
		elementor.iconManager.setSettings( 'selectedIcon', selected );

		this.setState( { selected } );
	};

	getSelected = () => {
		let { selected } = this.state;
		if ( '' === selected.value && this.props.selected && this.props.selected.value ) {
			selected = { value: this.props.selected.value, library: this.props.selected.library };
		}
		return selected;
	};

	getUploadCustomButton() {
		let onClick = () => {
			if ( 'GoPro' === this.state.activeTab ) {
				return;
			}
			this.setState( { activeTab: 'GoPro' } );
		};

		if ( this.props.customIconsURL ) {
			onClick = () => {
				window.open( this.props.customIconsURL, '_blank' );
			};
		}

		return (
			<div id="elementor-icons-manager__upload">
				<div id="elementor-icons-manager__upload__title">{ __( 'My Libraries', 'elementor' ) }</div>
				<button id="elementor-icons-manager__upload__button" className="elementor-button" onClick={ onClick }>{ __( 'Upload', 'elementor' ) }</button>
			</div>
		);
	}

	getSearchHTML() {
		return (
			<div id="elementor-icons-manager__search">
				<input placeholder={ 'Filter by name...' } onInput={ this.handleSearch } />
				<i className={ 'eicon-search' }></i>
			</div>
		);
	}

	render = () => {
		const activeTab = this.getActiveTab(),
			activeTabName = ( activeTab.name ) ? activeTab.name : activeTab,
			{ showSearch = true } = this.props,
			{ filter } = this.state;

		if ( 'GoPro' !== activeTab ) {
			if ( ! activeTabName || ! this.state.loaded[ activeTabName ] ) {
				return 'Loading';
			}

			if ( activeTab ) {
				activeTab.icons = this.getActiveTabIcons( activeTab );
			}
		}

		const selected = this.getSelected();
		return (
			<Fragment>
				<div id="elementor-icons-manager__sidebar" className={ 'elementor-templates-modal__sidebar' }>
					<div id="elementor-icons-manager__tab-links">
						{ this.getIconTabsLinks() }
						{ this.getUploadCustomButton() }
						{ this.getIconTabsLinks( false ) }
					</div>
				</div>
				<div id="elementor-icons-manager__main" className={ 'elementor-templates-modal__content' }>
					{ 'GoPro' === activeTabName ? <IconsGoPro />
						: <Fragment>
							{ showSearch ? this.getSearchHTML() : '' }
							<div id="elementor-icons-manager__tab__wrapper" ref={ this.scrollViewRef }>
								<div id="elementor-icons-manager__tab__title">{ activeTab.label }</div>
								<div id="elementor-icons-manager__tab__content_wrapper">
									<input type="hidden" name="icon_value" id="icon_value" value={ selected.value } />
									<input type="hidden" name="icon_type" id="icon_type" value={ selected.library } />
									{ this.state.loaded[ activeTab.name ] ? (
										<Tab
											setSelected={ this.setSelected }
											selected={ selected }
											filter={ filter }
											key={ activeTab.name }
											parentRef={ this.scrollViewRef }
											{ ... activeTab } />
									) : (
										'Loading'
									) }
								</div>
							</div>
						</Fragment>
					}
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
		containerElement,
	);
};
export { renderIconManager };

IconsManager.propTypes = {
	activeTab: PropTypes.any,
	customIconsURL: PropTypes.string,
	icons: PropTypes.any,
	loaded: PropTypes.any,
	modalView: PropTypes.any,
	recommended: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ),
	selected: PropTypes.any,
	showSearch: PropTypes.bool,
};
