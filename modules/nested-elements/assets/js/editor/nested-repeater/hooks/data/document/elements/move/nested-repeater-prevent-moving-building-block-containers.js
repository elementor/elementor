import { BaseProtectBuildingBlocks } from '../base-protect-building-blocks';

/**
 * Why `nested-repeater-prevent-deleting-building-block-containers` is not enough to handle it and this hook is created?
 * Since hooking only `document/elements/delete` of the building blocks containers and not `document/elements/move` too,
 * will produce a bug that will clone the building block container, the bug/clone will happen because:
 * `document/elements/move` is called first to `document/elements/delete` and then to: `document/elements/create`
 * the `document/elements/delete` get blocked by `NestedRepeaterPreventDeletingBuildingBlockContainers`.
 */
export class NestedRepeaterPreventMovingBuildingBlockContainers extends BaseProtectBuildingBlocks {
	getId() {
		return 'nested-repeater-prevent-moving-building-block-containers';
	}

	getCommand() {
		return 'document/elements/move';
	}
}
