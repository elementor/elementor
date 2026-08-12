import AtomicElementBaseModel from './atomic-element-base-model';

/**
 * AtomicListModel
 *
 * Custom model for e-list elements. Currently extends base model without modifications,
 * but registered to allow for list-specific editor behavior in the future.
 *
 * The show_markers toggle and children dependency logic is handled by:
 * - PHP: atomic-list-item.php (children_dependencies)
 * - TypeScript: list-type.ts (_syncShowMarkersToChildren)
 */
export default class AtomicListModel extends AtomicElementBaseModel {
}
