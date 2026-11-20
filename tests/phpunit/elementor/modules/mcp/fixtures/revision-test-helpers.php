<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp\Fixtures;

use Elementor\Core\Base\Document;
use Elementor\Modules\Mcp\Module as Mcp_Module;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

trait Revision_Test_Helpers {

	/**
	 * The MCP module is not instantiated in the test environment, so its experiment is registered here.
	 */
	private function register_revision_snapshots_experiment(): void {
		$experiments = Plugin::$instance->experiments;

		if ( ! $experiments->get_features( Mcp_Module::REVISION_SNAPSHOTS_EXPERIMENT_NAME ) ) {
			$experiments->add_feature( Mcp_Module::get_revision_snapshots_experimental_data() );
		}
	}

	private function create_elementor_page( string $status, array $elements ): int {
		$post_id = $this->factory()->post->create( [
			'post_type' => 'page',
			'post_status' => $status,
		] );

		$document = Plugin::$instance->documents->get( $post_id, false );
		$document->set_is_built_with_elementor( true );
		$document->save( [ 'elements' => $elements ] );

		$this->move_modified_date_to_the_past( $post_id );

		return $post_id;
	}

	/**
	 * `Utils::get_post_autosave` only returns autosaves modified strictly after the main post,
	 * so a page edited within the same second it was created would hide its autosave.
	 */
	private function move_modified_date_to_the_past( int $post_id ): void {
		global $wpdb;

		$past = gmdate( 'Y-m-d H:i:s', strtotime( '-1 day' ) );

		$wpdb->update(
			$wpdb->posts,
			[
				'post_modified' => $past,
				'post_modified_gmt' => $past,
			],
			[ 'ID' => $post_id ]
		);

		clean_post_cache( $post_id );
		Plugin::$instance->documents->get( $post_id, false );
	}

	private function containers( int $count ): array {
		$containers = [];

		for ( $i = 0; $i < $count; $i++ ) {
			$containers[] = [
				'id' => sprintf( 'e%07d', $i + 1 ),
				'elType' => 'container',
				'settings' => [],
				'elements' => [],
				'isInner' => false,
			];
		}

		return $containers;
	}

	private function elements_of( int $post_id ): array {
		return Plugin::$instance->documents->get( $post_id, false )->get_json_meta( Document::ELEMENTOR_DATA_META_KEY );
	}

	private function find_autosave_id( int $post_id ): int {
		$autosave = wp_get_post_autosave( $post_id, get_current_user_id() );

		return $autosave ? (int) $autosave->ID : 0;
	}

	/**
	 * @return int[]
	 */
	private function regular_revision_ids( int $post_id ): array {
		$revision_ids = wp_get_post_revisions( $post_id, [
			'orderby' => 'ID',
			'order' => 'DESC',
			'fields' => 'ids',
		] );

		return array_values( array_filter(
			array_map( 'intval', $revision_ids ),
			fn( int $revision_id ) => ! wp_is_post_autosave( $revision_id )
		) );
	}

	private function latest_revision_id( int $post_id ): int {
		return $this->regular_revision_ids( $post_id )[0] ?? 0;
	}
}
