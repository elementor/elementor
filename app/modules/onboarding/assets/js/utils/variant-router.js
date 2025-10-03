import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { ONBOARDING_STORAGE_KEYS } from './onboarding-event-tracking';

export default function VariantRouter( props ) {
	const variant = useMemo( () => {
		return localStorage.getItem( ONBOARDING_STORAGE_KEYS.AB_TEST_VARIANT );
	}, [] );

	const { componentA, componentB, ...routeProps } = props;

	if ( 'B' === variant ) {
		const ComponentB = componentB;
		return <ComponentB { ...routeProps } />;
	}

	const ComponentA = componentA;
	return <ComponentA { ...routeProps } />;
}

VariantRouter.propTypes = {
	componentA: PropTypes.elementType.isRequired,
	componentB: PropTypes.elementType.isRequired,
};
