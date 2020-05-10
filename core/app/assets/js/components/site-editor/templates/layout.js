import React from 'react';
import PropTypes from 'prop-types';
import Page from 'elementor-app/layout/page';
import SiteEditorMenu from '../organisms/menu';

export default class Layout extends React.Component {
	static propTypes = {
		headerButtons: PropTypes.arrayOf( PropTypes.object ),
		templateTypes: PropTypes.arrayOf( PropTypes.object ),
		children: PropTypes.object.isRequired,
	};

	static defaultProps = {
		headerButtons: [],
	};

	render() {
		const config = {
			// TODO: Translate.
			title: 'Site Editor',
			headerButtons: this.props.headerButtons,
			sidebar: <SiteEditorMenu items={ this.props.templateTypes } />,
			content: this.props.children,
		};

		return (
			<Page { ...config } />
		);
	}
}
