import React from 'react';
import { Button } from './';
import { List as DiagnosticsList } from './diagnostics';
import { useHealthCheck } from '../../hooks';

const Check = () => {
	const { data, refetch } = useHealthCheck();

	const Result = () => (
		<div>
			<h2>{ __( 'Result:' ) }</h2>
			<hr />
			<DiagnosticsList items={ data } />
			<hr />
		</div>
	);

	return (
		<React.Fragment>
			<Button onClick={ refetch } />
			{ Boolean( data?.length ) && <Result /> }
		</React.Fragment>
	);
};

export { Check };
export default Check;
