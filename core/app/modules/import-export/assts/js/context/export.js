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
		this.setState( { title: value } );
	}

	setIncludes = ( value, action ) => {
		if ( 'add' === action ) {
			this.setState( ( prevState ) => {
				return { includes: [ ...prevState.includes, value ] };
			} );
			setTimeout( () => {
				console.log( 'this.state', this.state );
			}, 1500 );
		} else if ( 'remove' === action ) {
			this.setState( ( prevState ) => {
				return { includes: prevState.includes.filter( ( item ) => item !== value ) };
			} );
			setTimeout( () => {
				console.log( 'this.state', this.state );
			}, 1500 );
		}
	}

	setPostTypes = ( options ) => {
		this.setState( { postTypes: options } );
		setTimeout( () => {
			console.log( 'this.state options: ', this.state );
		}, 1500 );
	}

	componentDidMount() {
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
