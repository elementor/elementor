import React from 'react';
import PropTypes from 'prop-types';

export const Context = React.createContext();

class TemplateTypesContext extends React.Component {
	static propTypes = {
		children: PropTypes.object.isRequired,
	};

	constructor( props ) {
		super( props );
		this.state = {
			templateTypes: [],
		};
	}

	componentDidMount() {
		this.getTemplateTypes().then( ( response ) => {
			this.setState( {
				templateTypes: response.data.template_types,
			} );
		} );
	}

	getTemplateTypes() {
		return new Promise( ( resolve ) => {
			resolve( {
					data: {
						template_types: elementorAppLoader.getData( 'template_types' ),
					},
				}
			);
		} );
	}

	render() {
		return (
			<Context.Provider value={ this.state }>
				{ this.props.children }
			</Context.Provider>
		);
	}
}

export const TemplateTypesConsumer = Context.Consumer;
export default TemplateTypesContext;
