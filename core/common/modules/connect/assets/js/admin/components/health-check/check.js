import React from 'react';
import { Button, Result } from './';
import { List as DiagnosticsList } from './diagnostics';
import { useHealthCheck } from '../../hooks';

const Check = () => {
	const { data, refetch, isError, isIdle, isLoading, isSuccess } = useHealthCheck();

	return (
		<React.Fragment>
			<Button onClick={ refetch } />
			{ ! isIdle &&
				<Result>
					{ isLoading && <span>{ __( 'Loading...' ) }</span> }
					{ isSuccess && <DiagnosticsList items={ data }/> }
					{ isError && <span>{ __( 'There was an error trying to perform the connection test.' ) }</span> }
				</Result>
			}
		</React.Fragment>
	);
};

export { Check };
export default Check;
