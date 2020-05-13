import React from 'react';
import PropTypes from 'prop-types';
import SitePart from './../molecules/site-part';
import './site-parts.css';

export default class SiteParts extends React.Component {
	static propTypes = {
		templateTypes: PropTypes.arrayOf( PropTypes.object ),
		hoverElement: PropTypes.func.isRequired,
	};

	static defaultProps = {
		templateTypes: [],
	};

	render() {
		const items = this.props.templateTypes.map( ( item ) => {
			return (
				<SitePart key={ item.id } { ...item }>
					{ React.createElement( this.props.hoverElement, item ) }
				</SitePart>
			);
		} );

		return (
			<section className="elementor-app__site-editor__site-parts">
				{ items }
			</section>
		);
	}
}
