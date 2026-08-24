import BaseAddSectionView from './base';
import { EditorOneEventManager } from 'elementor-editor-utils/editor-one-events';
import { getDraggedContainerView } from 'elementor-editor-utils/dragged-container';

export default class AddSectionView extends BaseAddSectionView {
	get id() {
		return 'elementor-add-new-section';
	}

	getDraggedContainerView() {
		return getDraggedContainerView();
	}

	getDroppableOptions() {
		const baseOptions = super.getDroppableOptions();

		return {
			...baseOptions,
			isDroppingAllowed: () => {
				return baseOptions.isDroppingAllowed() || Boolean( this.getDraggedContainerView() );
			},
			onDropping: ( side, event ) => {
				const draggedContainerView = this.getDraggedContainerView();

				if ( ! draggedContainerView ) {
					baseOptions.onDropping( side, event );

					return;
				}

				elementor.channels.editor.reply( 'element:dragged', null );

				$e.run( 'document/elements/move', {
					container: draggedContainerView.getContainer(),
					target: elementor.getPreviewContainer(),
				} );
			},
		};
	}

	onCloseButtonClick() {
		EditorOneEventManager.sendCanvasEmptyBoxAction( {
			targetName: 'close',
			containerCreated: false,
		} );
		this.closeSelectPresets();
	}
}
