<?php

namespace Elementor\Modules\Mcp\Media;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Mcp_Media_Feature_Gate {

	public const EXPERIMENT_NAME = 'e_mcp_media_upload';

	public static function get_experimental_data(): array {
		return [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'MCP media upload', 'elementor' ),
			'description' => esc_html__( 'Let MCP clients add images to the Media Library.', 'elementor' ),
			'hidden' => true,
			'default' => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_ALPHA,
		];
	}

	public static function is_enabled(): bool {
		$experiments = Plugin::$instance->experiments ?? null;
		$is_active = $experiments && $experiments->is_feature_active( self::EXPERIMENT_NAME );

		return (bool) $is_active;
	}

	public static function disabled_error(): \WP_Error {
		return new \WP_Error(
			'mcp_media_disabled',
			__( 'MCP media upload is disabled.', 'elementor' ),
			[ 'status' => \WP_Http::NOT_FOUND ]
		);
	}
}
