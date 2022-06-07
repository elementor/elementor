import { BaseProtectBuildingBlocks } from '../base-protect-building-blocks';

export class NestedRepeaterPreventDeletingBuildingBlockContainers extends BaseProtectBuildingBlocks {
	getId() {
		return 'nested-repeater-prevent-deleting-building-block-containers';
	}

	getCommand() {
		return 'document/elements/delete';
	}

	getContainerType() {
		return 'container';
	}
}
