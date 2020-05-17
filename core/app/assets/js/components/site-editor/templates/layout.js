import React from 'react';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import Page from 'elementor-app/layout/page';
import SiteEditorMenu from '../organisms/menu';
import TemplateTypesContext from '../context/template-types';

export default class Layout extends React.Component {
	static propTypes = {
		headerButtons: PropTypes.arrayOf( PropTypes.object ),
		children: PropTypes.object.isRequired,
	};

	static defaultProps = {
		headerButtons: [],
	};

	render() {
		const config = {
			title: __( 'Site Editor', 'elementor' ),
			headerButtons: this.props.headerButtons,
			sidebar: <SiteEditorMenu />,
			content: this.props.children,
		};

		return (
			<TemplateTypesContext>
				<Page { ...config } />
			</TemplateTypesContext>
		);
	}
}
