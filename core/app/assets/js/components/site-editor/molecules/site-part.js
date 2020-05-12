import React from 'react';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import './site-part.css';

export default class SitePart extends React.Component {
	static propTypes = {
		id: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
		className: PropTypes.string,
		urls: PropTypes.object,
		children: PropTypes.object.isRequired,
	};

	static defaultProps = {
		className: '',
	};

	render() {
		return (
			<section id={ `site-part__type-${ this.props.id }` } className="elementor-app__site-editor__site-part">
				<header>
					{ this.props.title }
					<a target="_blank" rel="noopener noreferrer" href={ this.props.urls.docs } >
						<i className="eicon-info" aria-hidden="true" title={ __( 'Help', 'elementor' ) } />
					</a>
				</header>
				<main>
					<div className="hover-content">
						{ this.props.children }
					</div>
				</main>
			</section>
		);
	}
}
