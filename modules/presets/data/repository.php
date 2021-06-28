<?php
namespace Elementor\Modules\Presets\Data;

use Elementor\Core\Base\Document;
use Elementor\Core\Utils\Collection;
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
		$post_type = Source_Local::CPT;
		$document_type_meta_key = Document::TYPE_META_KEY;
		$document_type_meta_value = Preset::TYPE;
		$document_element_type_key = Preset::ELEMENT_TYPE_META_KEY;
		$document_widget_type_key = Preset::WIDGET_TYPE_META_KEY;
		$is_default_key = Preset::DEFAULT_META_KEY;
		$settings_key = Preset::SETTINGS_META_KEY;

		$default_args = [
			'where' => [],
		];

		$args = wp_parse_args( $args, $default_args );

		$args['where'][] = "posts.post_type = '{$post_type}'";

		$where = array_reduce( $args['where'], function ( $current, $sentence ) {
			return $current . ' AND ' . $sentence;
		}, '1 = 1' );

		$query = "
			SELECT
				posts.*,
				(
					SELECT postsmeta_element.meta_value
					FROM {$this->wpdb->postmeta} postsmeta_element
					WHERE postsmeta_element.meta_key = '{$document_element_type_key}' AND postsmeta_element.post_id = posts.id
				) as element_type,
				(
					SELECT postmeta_widget.meta_value
					FROM {$this->wpdb->postmeta} postmeta_widget
					WHERE postmeta_widget.meta_key = '{$document_widget_type_key}' AND postmeta_widget.post_id = posts.id
				) as widget_type,
				(
					SELECT postmeta_default.meta_value
					FROM {$this->wpdb->postmeta} postmeta_default
					WHERE postmeta_default.meta_key = '{$is_default_key}' AND postmeta_default.post_id = posts.id
				) as is_default,
				(
					SELECT postmeta_settings.meta_value
					FROM {$this->wpdb->postmeta} postmeta_settings
					WHERE postmeta_settings.meta_key = '{$settings_key}' AND postmeta_settings.post_id = posts.id
				) as settings
			FROM {$this->wpdb->posts} posts
			INNER JOIN {$this->wpdb->postmeta} postsmeta
				ON postsmeta.post_id = posts.ID
				AND postsmeta.meta_key = '{$document_type_meta_key}'
				AND postsmeta.meta_value = '{$document_type_meta_value}'
			WHERE {$where};
		";

		return ( new Collection( $this->wpdb->get_results( $query, ARRAY_A ) ) )
			->map( function ( $item ) {
				return [
					'id' => (int) $item['ID'],
					'element_type' => $item['element_type'],
					'widget_type' => $item['widget_type'],
					'is_default' => $item['is_default'] ? true : false,
					'settings' => $item['settings'] ? json_decode( $item['settings'], true ) : [],
				];
			} );
	}

	public function find( $id ) {
		return $this->get_all( [
			'where' => [ $this->wpdb->prepare( 'posts.ID = %d', (int) $id ) ],
		] )->first();
	}

	/**
	 * Repository constructor.
	 */
	public function __construct() {
		global $wpdb;

		$this->wpdb = $wpdb;
	}
}
