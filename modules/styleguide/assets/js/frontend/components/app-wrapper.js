import React from 'react';
import { useSettings } from '../contexts/settings';
import Loader from './global/loader';

export default function AppWrapper( props ) {
	const { settings, isReady } = useSettings();

	if ( ! isReady ) {
		return <Loader />;
	}

	const isDebug = settings.get( 'config' ).get( 'is_debug' ),
		Wrapper = isDebug ? React.StrictMode : React.Fragment;

	return (
		<Wrapper>
			{ props.children }
		</Wrapper>
	);
}

AppWrapper.propTypes = {
	children: PropTypes.oneOfType( [
		PropTypes.node,
		PropTypes.arrayOf( PropTypes.node ),
	] ).isRequired,
};
