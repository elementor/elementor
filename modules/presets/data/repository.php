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
		$post_type = Source_Local::CPT;
		$document_type_meta_key = Document::TYPE_META_KEY;
		$document_type_meta_value = Preset::TYPE;
		$document_element_type_key = Preset::ELEMENT_TYPE_META_KEY;
		$document_widget_type_key = Preset::WIDGET_TYPE_META_KEY;

		$query = "
			SELECT
				posts.*,
				(
					SELECT postsmeta_element.meta_value
					FROM {$this->wpdb->postmeta} postsmeta_element
					WHERE postsmeta_element.meta_key = {$document_element_type_key} AND postsmeta_element.post_id = posts.id
				) as element_type
			FROM {$this->wpdb->posts} posts
			INNER JOIN {$this->wpdb->postmeta} postsmeta
				ON postsmeta.post_id = posts.ID
				AND postsmeta.meta_key = {$document_type_meta_key}
				AND postsmeta.meta_value = {$document_type_meta_value}
			WHERE posts.post_type = {$post_type}
		";
	}

	/**
	 * Repository constructor.
	 */
	public function __construct() {
		global $wpdb;

		$this->wpdb = $wpdb;
	}
}
