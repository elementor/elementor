import React from 'react';

const Result = ( { children } ) => (
	<div>
		<h2>{ __( 'Result:' ) }</h2>
		<hr/>
			{ children }
		<hr/>
	</div>
);

export { Result };
export default Result;

Result.propTypes = {
	children: PropTypes.any,
};
