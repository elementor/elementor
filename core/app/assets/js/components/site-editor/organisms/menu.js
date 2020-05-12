import React from 'react';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import MenuItem from './../molecules/menu-item';

export default class Menu extends React.Component {
	static propTypes = {
		items: PropTypes.arrayOf( PropTypes.object ),
	};

	static defaultProps = {
		items: [],
	};

	render() {
		const items =	this.props.items.map( ( item ) => {
			return <MenuItem key={ item.id } text={ item.title } {...item } />;
		} );

		return (
			<nav className="elementor-app__site-editor__menu">
				<MenuItem id="all-parts" text={ __( 'All Parts', 'elementor' ) } 	icon="eicon-filter" />
				<div className="elementor-app__site-editor__menu__items-title">
					{ __( 'Site Parts', 'elementor' ) }
				</div>
				{ items }
			</nav>
		);
	}
}
