export const Context = React.createContext();

class ExportContext extends React.Component {
	static propTypes = {
		children: PropTypes.object.isRequired,
	};

	constructor( props ) {
		super( props );

		this.state = {
			title: 'Initial Title',
			includes: [],
			postTypes: [],
			setTitle: this.setTitle,
			setIncludes: this.setIncludes,
			setPostTypes: this.setPostTypes,
		};
	}

	setTitle = ( value ) => {
		console.log( 'updating the title in the state' );
		this.setState( { title: value } );
	}

	setIncludes = ( value, action ) => {
		if ( 'add' === action ) {
			this.setState( ( prevState ) => {
				console.log( 'updating includes: adding value' );
				return { includes: [ ...prevState.includes, value ] };
			} );
		} else if ( 'remove' === action ) {
			this.setState( ( prevState ) => {
				console.log( 'updating includes: removing value' );
				return { includes: prevState.includes.filter( ( item ) => item !== value ) };
			} );
		}
	}

	setPostTypes = ( options ) => {
		this.setState( { postTypes: options } );
	}

	setIsLoading = ( value ) => {
		this.setState( { isLoading: value } );
	}

	render() {
		return (
			<Context.Provider value={ this.state }>
				{ this.props.children }
			</Context.Provider>
		);
	}
}

export const ExportConsumer = Context.Consumer;
export default ExportContext;
