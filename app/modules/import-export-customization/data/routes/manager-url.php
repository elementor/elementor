<?php
namespace Elementor\App\Modules\ImportExportCustomization\Data\Routes;

use Elementor\Plugin;
use Elementor\App\Modules\ImportExportCustomization\Data\Response;
use Elementor\Core\Base\Document;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Manager_Url extends Base_Route {
	private const ALLOWED_PANELS = [
		'global-classes-manager',
		'variables-manager',
	];

	protected function get_route(): string {
		return 'manager-url';
	}

	protected function get_method(): string {
		return \WP_REST_Server::READABLE;
	}

	protected function callback( $request ): \WP_REST_Response {
		$panel = $request->get_param( 'panel' );

		if ( ! in_array( $panel, self::ALLOWED_PANELS, true ) ) {
			return Response::error( 'Invalid panel parameter', 'invalid_panel' );
		}

		$url = $this->get_editor_url_with_panel( $panel );

		return Response::success( [
			'url' => $url,
		] );
	}

	private function get_editor_url_with_panel( string $panel ): string {
		$elementor_page = $this->get_elementor_page();

		if ( $elementor_page ) {
			$document = Plugin::$instance->documents->get( $elementor_page->ID );

			if ( $document && $document->is_built_with_elementor() ) {
				return add_query_arg( 'active-panel', $panel, $document->get_edit_url() );
			}
		}

		return add_query_arg(
			'active-panel',
			$panel,
			Plugin::$instance->documents->get_create_new_post_url( 'page' )
		);
	}

	private function get_elementor_page() {
		$pages = get_pages( [
			'post_status' => [ 'publish', 'draft' ],
			'meta_key' => Document::BUILT_WITH_ELEMENTOR_META_KEY,
			'sort_order' => 'desc',
			'sort_column' => 'post_modified',
			'number' => 1,
		] );

		return $pages[0] ?? null;
	}

	protected function get_args(): array {
		return [
			'panel' => [
				'type' => 'string',
				'description' => 'Panel ID to open in the editor',
				'required' => true,
				'enum' => self::ALLOWED_PANELS,
			],
		];
	}
}
