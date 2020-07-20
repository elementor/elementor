export const Context = React.createContext();

class ImportContext extends React.Component {
	static propTypes = {
		children: PropTypes.object.isRequired,
	};

	constructor( props ) {
		super( props );

		this.state = {
			title: 'Initial Title',
			includes: [],
			postTypes: [],
		};
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

export const ImportConsumer = Context.Consumer;
export default ImportContext;
