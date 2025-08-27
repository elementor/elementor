import { createLocation } from '@elementor/locations';

export const { Slot: TopSlot, inject: injectIntoTop } = createLocation();

export const { Slot: LogicSlot, inject: injectIntoLogic } = createLocation();
