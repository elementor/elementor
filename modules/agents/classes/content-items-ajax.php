<?php

namespace Elementor\Modules\Agents\Classes;

use Elementor\Core\Utils\Exceptions;
use Elementor\Modules\Agents\Agent_Ready_Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Content_Items_Ajax {

	const ACTION = 'agents_ready_list_content_items';

	private Agent_Ready_Settings $settings;

	private Markdown_Content_Catalog $catalog;

	public function __construct( Agent_Ready_Settings $settings, Markdown_Content_Catalog $catalog ) {
		$this->settings = $settings;
		$this->catalog  = $catalog;
	}

	/**
	 * @param array $data Ajax request data: { module: string, postType: string, term?: string, page?: int }.
	 * @return array{items: array, hasMore: bool}
	 * @throws \Exception When the user can't manage options or the module is unknown.
	 */
	public function handle( array $data ): array {
		if ( ! current_user_can( 'manage_options' ) ) {
			throw new \Exception( esc_html__( 'Permission denied.', 'elementor' ), Exceptions::FORBIDDEN ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		$module = isset( $data['module'] ) && is_string( $data['module'] ) ? $data['module'] : '';

		if ( ! in_array( $module, [ Agent_Ready_Settings::MODULE_LLMS_TXT, Agent_Ready_Settings::MODULE_MARKDOWN_CONTENT ], true ) ) {
			throw new \Exception( esc_html__( 'Unknown content module.', 'elementor' ), Exceptions::BAD_REQUEST ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		$post_type = isset( $data['postType'] ) && is_string( $data['postType'] ) ? sanitize_key( $data['postType'] ) : '';

		if ( ! $this->is_listable_post_type( $module, $post_type ) ) {
			return [
				'items'   => [],
				'hasMore' => false,
			];
		}

		$term = isset( $data['term'] ) && is_string( $data['term'] ) ? trim( sanitize_text_field( $data['term'] ) ) : '';
		$page = isset( $data['page'] ) ? max( 1, absint( $data['page'] ) ) : 1;

		return $this->catalog->list_page( $post_type, $term, $page, $this->get_excluded_post_ids( $module ) );
	}

	private function get_excluded_post_ids( string $module ): array {
		return Agent_Ready_Settings::MODULE_LLMS_TXT === $module
			? $this->settings->get_llms_excluded_post_ids()
			: $this->settings->get_markdown_excluded_post_ids();
	}

	private function is_listable_post_type( string $module, string $post_type ): bool {
		if ( Agent_Ready_Settings::MODULE_LLMS_TXT === $module ) {
			return $this->settings->is_llms_enabled()
				&& in_array( $post_type, $this->settings->get_llms_post_types(), true );
		}

		return $this->settings->is_markdown_enabled()
			&& in_array( $post_type, $this->settings->get_markdown_post_types(), true );
	}
}
