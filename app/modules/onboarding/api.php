<?php
namespace Elementor\App\Modules\Onboarding;

use Elementor\Includes\EditorAssetsAPI;

class API {
	protected EditorAssetsAPI $editor_assets_api;

	public function __construct( EditorAssetsAPI $editor_assets_api ) {
		$this->editor_assets_api = $editor_assets_api;
	}

	public function get_ab_testing_data( $force_request = false ): array {
		$assets_data = $this->editor_assets_api->get_assets_data( $force_request );

		return $this->extract_ab_testing_config( $assets_data );
	}

	private function extract_ab_testing_config( array $json_data ): array {
		if ( empty( $json_data ) || ! is_array( $json_data ) ) {
			return [];
		}

		return $json_data[0] ?? [];
	}

	public function is_experiment_enabled( string $experiment_key, $force_request = false ): bool {
		$experiment_number = $this->extract_experiment_number( $experiment_key );

		if ( $experiment_number && $this->post_exists_with_title( $experiment_number ) ) {
			return true;
		}

		$ab_testing_data = $this->get_ab_testing_data( $force_request );

		return $ab_testing_data['coreOnboarding'][ $experiment_key ] ?? false;
	}

	private function extract_experiment_number( string $experiment_key ): ?string {
		if ( preg_match( '/(\d+)$/', $experiment_key, $matches ) ) {
			return $matches[1];
		}

		return null;
	}

	private function post_exists_with_title( string $title ): bool {
		$posts = get_posts( [
			'title' => $title,
			'post_type' => 'any',
			'post_status' => 'any',
			'numberposts' => 1,
			'fields' => 'ids',
		] );

		return ! empty( $posts );
	}

	public function get_experiment_variant( string $experiment_key ): ?string {
		$experiment_number = $this->extract_experiment_number( $experiment_key );

		if ( ! $experiment_number ) {
			return null;
		}

		$post = get_posts( [
			'title' => $experiment_number,
			'post_type' => 'any',
			'post_status' => 'any',
			'numberposts' => 1,
		] );

		if ( empty( $post ) ) {
			return null;
		}

		$post_content = $post[0]->post_content;

		if ( stripos( $post_content, 'variant b' ) !== false || stripos( $post_content, 'b' ) === 0 ) {
			return 'B';
		}

		if ( stripos( $post_content, 'variant a' ) !== false || stripos( $post_content, 'a' ) === 0 ) {
			return 'A';
		}

		return 'B';
	}
}
