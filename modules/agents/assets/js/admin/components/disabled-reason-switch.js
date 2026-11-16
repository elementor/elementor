import { useId } from 'react';
import Box from '@elementor/ui/Box';
import Infotip from '@elementor/ui/Infotip';
import Switch from '@elementor/ui/Switch';
import Typography from '@elementor/ui/Typography';
import PropTypes from 'prop-types';

const REASON_MAX_WIDTH = 280;

// A disabled switch ignores pointer events, so the wrapper span keeps the Infotip hover working.
const WRAPPER_STYLE = { display: 'inline-flex' };

const VISUALLY_HIDDEN_STYLE = {
	position: 'absolute',
	width: '1px',
	height: '1px',
	overflow: 'hidden',
	clip: 'rect(0 0 0 0)',
	whiteSpace: 'nowrap',
};

export const DisabledReasonSwitch = ( { disabledReason = null, inputProps = {}, ...switchProps } ) => {
	const reasonId = useId();

	if ( ! disabledReason ) {
		return <Switch { ...switchProps } inputProps={ inputProps } />;
	}

	return (
		<Infotip
			arrow
			placement="top"
			content={ (
				<Box p={ 2 } maxWidth={ REASON_MAX_WIDTH } boxSizing="border-box">
					<Typography variant="body2" color="text.primary">{ disabledReason }</Typography>
				</Box>
			) }
		>
			<span style={ WRAPPER_STYLE }>
				<Switch { ...switchProps } inputProps={ { ...inputProps, 'aria-describedby': reasonId } } />
				<span id={ reasonId } style={ VISUALLY_HIDDEN_STYLE }>{ disabledReason }</span>
			</span>
		</Infotip>
	);
};

DisabledReasonSwitch.propTypes = {
	disabledReason: PropTypes.string,
	inputProps: PropTypes.object,
};
