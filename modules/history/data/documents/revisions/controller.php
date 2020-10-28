<?php
namespace Elementor\Modules\History\Data\Documents\Revisions;

use Elementor\Data\Base\SubController;
use Elementor\Modules\History\Revisions_Manager;
use Elementor\Plugin;

class Controller extends SubController {
	public function get_parent_name() {
		return 'documents';
	}

	public function get_name() {
		return 'revisions';
	}

	public function get_route() {
		return '/(?P<revision_id>[\w]+)';
	}

	public function register_endpoints() {
		// Using internal endpoint as 'base route' for 'data' endpoint.
		$this->index_endpoint->register_item_route( \WP_REST_Server::READABLE, [
			'id_arg_name' => 'revision_id',
		] );
	}

	public function get_items( $request ) {
		$revisions = [];
		$document_id = $request->get_param( 'document_id' );

		if ( $document_id ) {
			$revisions = Revisions_Manager::get_revisions( $document_id );
		}

		return $revisions;
	}

	public function get_item( $request ) {
		$revision = Plugin::$instance->documents->get( $request->get_param( 'revision_id' ) );
		$document_id = (int) $request->get_param( 'document_id' );

		if ( ! $revision || $revision->get_main_id() !== $document_id ) {
			return new \WP_Error( 'rest_unknown_revision', __( 'Unable to get revision information.' ), [ 'status' => 404 ] );
		}

		return Revisions_Manager::get_revision( $revision->get_post(), [
			'include_data' => true,
		] );
	}

	public function get_permission_callback( $request ) {
		switch ( $request->get_method() ) {
			case 'GET':
				$revision_id = $request->get_param( 'id' );

				if ( ! $revision_id ) {
					$revision_id = $request->get_param( 'documentId' );
				}

				if ( $revision_id ) {
					return current_user_can( 'edit_post', $revision_id );
				}

				break;
		}

		return parent::get_permission_callback( $request );
	}

}
