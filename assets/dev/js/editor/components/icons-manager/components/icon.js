import React, { Component } from "react";

const Icon = class extends Component {
	render = () =>{
		const itemStyle = {
			width: '80px',
			height: '80px',
			border: '1px solid gray',
			display: 'flex',
			justifyContent: 'center',
			flexDirection: 'column',
		};
		return <div style={itemStyle}>
			<span
				key={ this.props.keyID }
				className={ this.props.className }
				data={ this.props.data }
			/>
		</div>;

	}
};

export default Icon;