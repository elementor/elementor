import React from 'react';
import { Button } from './';
import { List as DiagnosticsList } from './diagnostics';
import { useConnectionTest } from '../../hooks';

const Test = () => {
	const { data, refetch } = useConnectionTest();

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
			{ data?.length && <Result /> }
		</React.Fragment>
	);
};

export { Test };
export default Test;
