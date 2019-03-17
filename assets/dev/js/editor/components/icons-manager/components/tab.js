import React, { Component } from 'react';
import Store from './../classes/store';
import Icon from './Icon';

class Tab extends Component {
	state = {
		selected: null,
	};

	getDefaultSettings = () => {
		return {
			name: '',
			url: '',
			prefix: '',
			displayPrefix: '',
			ver: '',
			enqueue: [],
			exclude: [],
			include: [],
			icons: [],
			fetchJson: false,
		};
	};

	getIconsOfType( type, icons ) {
		return Object.entries( icons ).map( icon => {
			const iconData = icon[ 1 ],
				iconName = icon[ 0 ];
			return (
				<Icon
					key={ type + '-' + iconName }
					library={ type }
					keyID={ iconName }
					className={ iconData.displayPrefix + ' ' + iconData.selector }
					data={ { ... icon[ 1 ] } }
				/>
			);
		} );
	}

	handleFullIconList = () => {
		let fullIconList = [];
		Object.entries( this.props.icons ).forEach( library => {
			fullIconList.push( this.getIconsOfType( library[ 0 ], library[ 1 ] ) );
		} );
		return fullIconList;
	};

	getIconsComponentList = () => {
		const { name, icons } = this.props;
		if ( 'all' === name ) {
			return this.handleFullIconList();
		}
		return this.getIconsOfType( name, icons );
	};

	render = () => {
		const wrapperStyle = {
			display: 'flex',
			width: '800px',
			margin: '0 auto',
			flexWrap: 'wrap',
			height: '500px',
		};
		return (
			<div id={ 'tab-content-container' } style={ wrapperStyle }>
				{ this.getIconsComponentList() }
			</div>
		);
	};
}

export default Tab;
