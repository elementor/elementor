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
		// TODO: Try not use here sub-endpoint but endpoint.
		$this->index_endpoint->register_item_route( \WP_REST_Server::READABLE, [
			'id_arg_name' => 'revision_id',
		] );

		$this->index_endpoint->register_sub_endpoint( new Endpoints\Data( $this->index_endpoint, '/(?P<revision_id>[\w]+)' ) );
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

		$post = $revision->get_post();

		$revision_data = (array) wp_get_post_revision( $post );
		$revision_data['data'] = [
			'settings' => $revision->get_settings(),
			'elements' => $revision->get_elements_data(),
		];

		return $revision_data;
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
