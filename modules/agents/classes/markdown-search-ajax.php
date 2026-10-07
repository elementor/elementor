<?php

namespace Elementor\Modules\Agents\Classes;

use Elementor\Core\Utils\Exceptions;
use Elementor\Modules\Agents\Agent_Ready_Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Markdown_Search_Ajax {

	const ACTION = 'agents_ready_search_markdown';

	private Agent_Ready_Settings $settings;

	private Markdown_Content_Catalog $catalog;

	public function __construct( Agent_Ready_Settings $settings, Markdown_Content_Catalog $catalog ) {
		$this->settings = $settings;
		$this->catalog  = $catalog;
	}

	/**
	 * @param array $data Ajax request data: { term?: string }.
	 * @return array{items: array}
	 * @throws \Exception When the user can't manage options.
	 */
	public function handle( array $data ): array {
		if ( ! current_user_can( 'manage_options' ) ) {
			throw new \Exception( esc_html__( 'Permission denied.', 'elementor' ), Exceptions::FORBIDDEN ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		if ( ! $this->settings->is_markdown_enabled() ) {
			return [ 'items' => [] ];
		}

		$term = isset( $data['term'] ) && is_string( $data['term'] ) ? trim( sanitize_text_field( $data['term'] ) ) : '';

		return [
			'items' => $this->catalog->search( $this->settings->get_markdown_post_types(), $term ),
		];
	}
}
