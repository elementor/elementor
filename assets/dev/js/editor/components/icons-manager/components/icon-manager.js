import React, { Component } from 'react';
import Tab from './tab';
import IconLibrary from './../classes/icon-library';
import Store from './../classes/store';

import iconTabs from './../classes/icon-tabs-config';

class IconsManager extends Component {
	state = {
		activeTab: '',
		selected: {
			type: '',
			value: '',
		},
		loaded: {},
	};

	componentDidMount() {
		const loaded = {};
		iconTabs.forEach( ( tab, index ) => {
			loaded[ tab.name ] = false;
		} );
		this.setState( { loaded: loaded } );
	}

	loadAllTabs = () => {
		const { loaded } = this.state;
		iconTabs.forEach( ( tabSettings, index ) => {
			if ( loaded[ tabSettings.name ] ) {
				return;
			}
			IconLibrary.initIconType( tabSettings, () => {
				loaded[ tabSettings.name ] = true;
			} );
		} );
		this.updateLoaded( 'all' );
	};

	getActiveTab = () => {
		let { activeTab, loaded } = this.state;
		if ( ! activeTab ) {
			if ( this.props.activeTab ) {
				activeTab = this.props.activeTab;
			} else {
				activeTab = iconTabs[ 0 ].name;
			}
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

		IconLibrary.initIconType( tabSettings, () =>
			this.updateLoaded( activeTab ),
		);
		return false;
	};

	updateLoaded( libraryName ) {
		const { loaded } = this.state;
		loaded[ libraryName ] = true;
		this.setState( { loaded: loaded } );
	}

	getIconTabsLinks = () => {
		return iconTabs.map( ( tab, index ) => {
			return (
				<span
					key={ index }
					onClick={ () => {
						if ( tab.name === this.state.activeTab ) {
							return;
						}
						this.setState( { activeTab: tab.name } );
					} }>
					{ tab.name }
				</span>
			);
		} );
	};

	getActiveTabIcons = activeTab => {
		if ( 'all' === activeTab.name ) {
			const icons = {};
			iconTabs.forEach( ( tabSettings, index ) => {
				if ( 'all' === tabSettings.name ) {
					return;
				}
				icons[ tabSettings.name ] = Store.getIcons( tabSettings );
			} );
			return icons;
		}
		return Store.getIcons( activeTab );
	};

	render = () => {
		const activeTab = this.getActiveTab();
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
					<div className={ 'icons-manager--search' }>
						<input type={ 'search' }/>
					</div>
					<div className={ 'icons-manager--tab__container' }>
						{ activeTab ? (
							<Tab key={ activeTab.name } { ... activeTab } />
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
