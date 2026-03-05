import { type PropKey, type PropType, type PropValue } from '@elementor/editor-props';
import { type BreakpointId } from '@elementor/editor-responsive';
import { type StyleDefinition, type StyleDefinitionState, type StyleDefinitionVariant } from '@elementor/editor-styles';

export type StyleDefinitionStateWithNormal = NonNullable< StyleDefinitionState > | 'normal';

type StatesMapping< T > = Partial< Record< StyleDefinitionStateWithNormal, T > >;

export type StyleVariantDetails = {
	style: StyleDefinition;
	provider: string | null;
	variant: StyleDefinitionVariant;
};

export type SnapshotPropValue = StyleVariantDetails & {
	value: PropValue;
};

export type StylesInheritanceSnapshot = Record< string, SnapshotPropValue[] >;

export type StylesInheritanceSnapshotsSlot = {
	snapshot?: StylesInheritanceSnapshot;
	stateSpecificSnapshot?: StylesInheritanceSnapshot; // with only prop values of the current state, used for inheritance  - e.g. mobile-hover inherits first from tablet-hover specific snapshot
};

export type BreakpointStatesSlotsMapping = StatesMapping< StylesInheritanceSnapshotsSlot >;

export type BreakpointsStatesSnapshotsMapping = Partial< Record< BreakpointId, BreakpointStatesSlotsMapping > >;

type BreakpointStatesStyles = StatesMapping< StyleVariantDetails[] >;

export type BreakpointsStatesStyles = Partial< Record< BreakpointId, Partial< BreakpointStatesStyles > > >;

export type BreakpointsInheritancePath = Record< BreakpointId, BreakpointId[] >;

export type StyleInheritanceMetaProps = {
	breakpoint: BreakpointId | null;
	state: StyleDefinitionState;
};

export type StylesInheritanceSnapshotGetter = (
	meta: StyleInheritanceMetaProps
) => StylesInheritanceSnapshot | undefined;

export type StylesInheritanceAPI = {
	getSnapshot: ( meta: StyleInheritanceMetaProps ) => StylesInheritanceSnapshot | undefined;
	getInheritanceChain: (
		snapshotField: StylesInheritanceSnapshot,
		path: PropKey[],
		basePropType: PropType
	) => SnapshotPropValue[];
};
