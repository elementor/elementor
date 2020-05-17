import React from 'react';
import PropTypes from 'prop-types';
import SitePart from './../molecules/site-part';
import { TemplateTypesConsumer } from '../context/template-types';
import './site-parts.css';

export default class SiteParts extends React.Component {
	static propTypes = {
		hoverElement: PropTypes.func.isRequired,
	};

	render() {
		return (
			<section className="elementor-app__site-editor__site-parts">
				<TemplateTypesConsumer>
					{ ( state ) => (
						state.templateTypes.map( ( item ) => (
							<SitePart key={ item.type } { ...item }>
								{ React.createElement( this.props.hoverElement, item ) }
							</SitePart>
						) )
					) }
				</TemplateTypesConsumer>
			</section>
		);
	}
}
