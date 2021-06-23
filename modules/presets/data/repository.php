<?php
namespace Elementor\Modules\Presets\Data;

use Elementor\Core\Base\Document;
use Elementor\TemplateLibrary\Source_Local;
use Elementor\Modules\Presets\Documents\Preset;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Repository {
	/**
	 * @var static
	 */
	private static $instance = null;

	/**
	 * @var \wpdb
	 */
	private $wpdb;

	/**
	 * @return static
	 */
	public static function instance() {
		if ( ! static::$instance ) {
			static::$instance = new static();
		}

		return static::$instance;
	}

	public function get_all( $args = [] ) {
		$default_args = [
			'posts_per_page' => -1,
			'post_type' => Source_Local::CPT,
			'meta_query' => [
				[
					'key' => Document::TYPE_META_KEY,
					'value' => Preset::TYPE,
					'compare' => '=',
				],
			],
		];

		$args = array_merge_recursive( $default_args, $args );

		$query = new \WP_Query( $args );
	}

	/**
	 * Repository constructor.
	 */
	public function __construct() {
		global $wpdb;

		$this->wpdb = $wpdb;
	}
}
