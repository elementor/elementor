import * as React from 'react';
import { useMemo } from 'react';
import { createArrayPropUtils, type PropKey } from '@elementor/editor-props';
import { Box } from '@elementor/ui';

/* eslint-disable */
import { PropKeyProvider, PropProvider, useBoundProp } from '../bound-prop-context';
import { PopoverContent } from '../components/popover-content';
import { PopoverGridContainer } from '../components/popover-grid-container';
import { Repeater } from '../components/repeater';
import { createControl } from '../create-control';
import {
	type ChildControlConfig,
	RepeatableControlContext,
	useRepeatableControlContext,
} from '../hooks/use-repeatable-control-context';

type RepeatableControlProps = {
	label: string;
	repeaterLabel: string;
	childControlConfig: ChildControlConfig;
	showDuplicate?: boolean;
	showToggle?: boolean;
	initialValues?: object;
	patternLabel?: string;
	placeholder?: string;
};

export const RepeatableControl = createControl(
	( {
		repeaterLabel,
		childControlConfig,
		showDuplicate,
		showToggle,
		initialValues,
		patternLabel,
		placeholder,
	}: RepeatableControlProps ) => {
		const { propTypeUtil: childPropTypeUtil } = childControlConfig;

		if ( ! childPropTypeUtil ) {
			return null;
		}

		const childArrayPropTypeUtil = useMemo(
			() => createArrayPropUtils( childPropTypeUtil.key, childPropTypeUtil.schema ),
			[ childPropTypeUtil.key, childPropTypeUtil.schema ]
		);

		const { propType, value, setValue } = useBoundProp( childArrayPropTypeUtil );
		const ItemLabel = ( { value: itemValue }: { value: any } ) => {
			const pattern = patternLabel || '';
			const finalLabel = interpolate( pattern, itemValue.value );

			if ( finalLabel ) {
				return <span>{ finalLabel }</span>;
			}

			return (
				<Box component="span" color="text.tertiary">
					{ placeholder }
				</Box>
			);
		};

		return (
			<PropProvider propType={ propType } value={ value } setValue={ setValue }>
				<RepeatableControlContext.Provider value={ childControlConfig }>
					<Repeater
						openOnAdd
						values={ value ?? [] }
						setValues={ setValue }
						label={ repeaterLabel }
						isSortable={ false }
						itemSettings={ {
							Icon: ItemIcon,
							Label: ItemLabel,
							Content: ItemContent,
							initialValues: childPropTypeUtil.create( initialValues || null ),
						} }
						showDuplicate={ showDuplicate }
						showToggle={ showToggle }
					/>
				</RepeatableControlContext.Provider>
			</PropProvider>
		);
	}
);

const ItemContent = ( { bind }: { bind: PropKey } ) => {
	return (
		<PropKeyProvider bind={ bind }>
			<Content />
		</PropKeyProvider>
	);
};

// TODO: Configurable icon probably can be somehow part of the injected control and bubbled up to the repeater
const ItemIcon = () => <></>;

const Content = () => {
	const { component: ChildControl, props = {} } = useRepeatableControlContext();

	return (
		<PopoverContent p={ 1.5 }>
			<PopoverGridContainer>
				<ChildControl { ...props } />
			</PopoverGridContainer>
		</PopoverContent>
	);
};

const interpolate = ( template: string, data: object ) => {
	//remove it to be generic
	if ( Object.values( data ).some( ( value ) => value.value === '' || value === '' ) ) {
		return null;
	}
	return new Function( ...Object.keys( data ), `return \`${ template }\`;` )( ...Object.values( data ) );
};
