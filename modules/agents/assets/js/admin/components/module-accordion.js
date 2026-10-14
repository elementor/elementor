import { AlertCircleIcon, ChevronDownIcon, ChevronUpIcon, CircleCheckFilledIcon, CircleXFilledIcon } from '@elementor/icons';
import Accordion from '@elementor/ui/Accordion';
import AccordionDetails from '@elementor/ui/AccordionDetails';
import AccordionSummary from '@elementor/ui/AccordionSummary';
import Stack from '@elementor/ui/Stack';
import Switch from '@elementor/ui/Switch';
import Typography from '@elementor/ui/Typography';
import PropTypes from 'prop-types';

import { MODULE_STATUS_DISABLED, MODULE_STATUS_ENABLED, MODULE_STATUS_WARNING } from '../constants';

const stopEventPropagation = ( event ) => event.stopPropagation();

const statusIcons = {
	[ MODULE_STATUS_ENABLED ]: <CircleCheckFilledIcon color="success" />,
	[ MODULE_STATUS_DISABLED ]: <CircleXFilledIcon color="error" />,
	[ MODULE_STATUS_WARNING ]: <AlertCircleIcon color="warning" />,
};

export const ModuleAccordion = ( { title, description, status, isEnabled, isToggleDisabled, onToggle, isExpanded, onExpandedChange, children } ) => (
	<Accordion
		variant="outlined"
		expanded={ isExpanded }
		onChange={ onExpandedChange }
		sx={ { borderRadius: '12px', maxWidth: '100%', minWidth: 0 } }
	>
		<AccordionSummary
			expandIcon={ null }
			sx={ { py: 2, borderBottom: isExpanded ? 1 : 0,
				borderColor: 'divider' } }
		>
			<Stack direction="row" alignItems="center" justifyContent="space-between" width="100%">
				<Stack direction="row" alignItems="center" spacing={ 1 }>
					{ statusIcons[ status ] }
					<Typography variant="h6">{ title }</Typography>
					{ ! isExpanded && (
						<Typography variant="body2" color="text.tertiary">{ description }</Typography>
					) }
				</Stack>
				<Stack direction="row" alignItems="center" spacing={ 2 }>
					<Switch
						size="small"
						checked={ isEnabled }
						disabled={ isToggleDisabled }
						onChange={ onToggle }
						onClick={ stopEventPropagation }
						sx={ { '& .MuiSwitch-input': { position: 'absolute' } } }
					/>
					{ isExpanded ? <ChevronUpIcon fontSize="small" /> : <ChevronDownIcon fontSize="small" /> }
				</Stack>
			</Stack>
		</AccordionSummary>
		<AccordionDetails sx={ { p: 0 } }>
			{ children }
		</AccordionDetails>
	</Accordion>
);

ModuleAccordion.propTypes = {
	title: PropTypes.string.isRequired,
	description: PropTypes.string.isRequired,
	status: PropTypes.oneOf( [ MODULE_STATUS_ENABLED, MODULE_STATUS_DISABLED, MODULE_STATUS_WARNING ] ).isRequired,
	isEnabled: PropTypes.bool.isRequired,
	isToggleDisabled: PropTypes.bool,
	onToggle: PropTypes.func.isRequired,
	isExpanded: PropTypes.bool.isRequired,
	onExpandedChange: PropTypes.func.isRequired,
	children: PropTypes.node.isRequired,
};
