<?php
namespace Elementor\Modules\History\Data\Documents\Revisions\Endpoints;

use Elementor\Data\Base\SubEndpoint;
use Elementor\Plugin;

class Data extends SubEndpoint {
	public function get_name() {
		return 'data';
	}

	public function get_items( $request ) {
		$revision = Plugin::$instance->documents->get( $request->get_param( 'revision_id' ) );
		$document_id = $request->get_param( 'document_id' );

		if ( ! $revision || $revision->get_main_id() !== (int) $document_id ) {
			return new \WP_Error(
				'rest_unknown_revision',
				__( 'Unable to get revision data information.' ),
				[ 'status' => 404 ]
			);
		}

		return [
			'settings' => $revision->get_settings(),
			'elements' => $revision->get_elements_data(),
		];
	}
}
