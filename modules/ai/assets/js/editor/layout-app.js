const LayoutApp = ( props ) => {
	return (
		<div style={ {
			position: 'fixed',
			left: '50%',
			bottom: '20px',
			transform: 'translateX(-50%)',
			background: '#F00',
			color: '#FFF',
			padding: '10px',
			zIndex: 999999,
			textAlign: 'center',
		} }>
			<h2>Layout App</h2>
			<button onClick={ props.onClose }>Close</button>
		</div>
	);
};

LayoutApp.propTypes = {
	onClose: PropTypes.func.isRequired,
};

export default LayoutApp;
