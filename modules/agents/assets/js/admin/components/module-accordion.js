import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, CircleCheckFilledIcon, CircleXFilledIcon } from '@elementor/icons';
import Accordion from '@elementor/ui/Accordion';
import AccordionDetails from '@elementor/ui/AccordionDetails';
import AccordionSummary from '@elementor/ui/AccordionSummary';
import Chip from '@elementor/ui/Chip';
import Stack from '@elementor/ui/Stack';
import Switch from '@elementor/ui/Switch';
import Typography from '@elementor/ui/Typography';
import PropTypes from 'prop-types';

const stopEventPropagation = ( event ) => event.stopPropagation();

export const ModuleAccordion = ( { title, description, isEnabled, onToggle, children } ) => {
	const [ isExpanded, setIsExpanded ] = useState( false );

	return (
		<Accordion
			variant="outlined"
			expanded={ isExpanded }
			onChange={ ( event, expanded ) => setIsExpanded( expanded ) }
			sx={ { borderRadius: '12px' } }
		>
			<AccordionSummary
				expandIcon={ null }
				sx={ { py: 2, borderBottom: isExpanded ? 1 : 0,
					borderColor: 'divider' } }
			>
				<Stack direction="row" alignItems="center" justifyContent="space-between" width="100%">
					<Stack direction="row" alignItems="center" spacing={ 1 }>
						{ isEnabled
							? <CircleCheckFilledIcon color="success" />
							: <CircleXFilledIcon color="error" />
						}
						<Typography variant="h6">{ title }</Typography>
						{ ! isExpanded && (
							<Chip
								label={ description }
								size="small"
								variant="outlined"
								shape="rounded"
							/>
						) }
					</Stack>
					<Stack direction="row" alignItems="center" spacing={ 2 }>
						<Switch
							size="small"
							checked={ isEnabled }
							onChange={ onToggle }
							onClick={ stopEventPropagation }
							sx={ { '& .MuiSwitch-input': { position: 'absolute' } } }
						/>
						{ isExpanded ? <ChevronUpIcon fontSize="small" /> : <ChevronDownIcon fontSize="small" /> }
					</Stack>
				</Stack>
			</AccordionSummary>
			{ isExpanded && (
				<AccordionDetails sx={ { px: 6, py: 3 } }>
					<Stack spacing={ 1 }>
						<Typography variant="subtitle1">{ description }</Typography>
						{ children }
					</Stack>
				</AccordionDetails>
			) }
		</Accordion>
	);
};

ModuleAccordion.propTypes = {
	title: PropTypes.string.isRequired,
	description: PropTypes.string.isRequired,
	isEnabled: PropTypes.bool.isRequired,
	onToggle: PropTypes.func.isRequired,
	children: PropTypes.node.isRequired,
};
