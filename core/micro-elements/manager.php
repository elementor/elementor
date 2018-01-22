<?php
namespace Elementor\Core\MicroElements;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Manager {

	const TAG_LABEL = 'elementor-tag';

	private $tags_groups = [];

	private $tags_info = [];

	public function __construct() {
		$this->add_actions();
	}

	public function parse_tags_text( $text, array $settings, callable $parse_callback ) {
		if ( ! empty( $settings['returnType'] ) && 'object' === $settings['returnType'] ) {
			return $this->parse_tag_text( $text, $settings, $parse_callback );
		}

		return preg_replace_callback( '/\[' . self::TAG_LABEL . '.+?(?=\])\]/', function( $tag_text_match ) use ( $settings, $parse_callback ) {
			return $this->parse_tag_text( $tag_text_match[0], $settings, $parse_callback );
		}, $text );
	}

	public function parse_tag_text( $tag_text, array $settings, $parse_callback ) {
		$tag_data = $this->get_tag_text_data( $tag_text );

		if ( ! $tag_data ) {
			if ( ! empty( $settings['returnType'] ) && 'object' === $settings['returnType'] ) {
				return [];
			}

			return '';
		}

		return call_user_func_array( $parse_callback, $tag_data );
	}

	public function get_tag_text_data( $tag_text ) {
		preg_match( '/id="(.+?(?="))"/', $tag_text, $tag_id_match );

		preg_match( '/name="(.+?(?="))"/', $tag_text, $tag_name_match );

		preg_match( '/settings="(.+?(?="]))/', $tag_text, $tag_settings_match );

		if ( ! $tag_id_match || ! $tag_name_match || ! $tag_settings_match ) {
			return $tag_text;
		}

		return [
			'id' => $tag_id_match[1],
			'name' => $tag_name_match[1],
			'settings' => json_decode( $tag_settings_match[1], true ),
		];
	}

	/**
	 * @param string $tag_id
	 * @param string $tag_name
	 * @param array  $settings
	 *
	 * @return Tag
	 */
	public function create_tag( $tag_id, $tag_name, array $settings = [] ) {
		$tag_info = $this->get_tag_info( $tag_name );

		if ( ! $tag_info ) {
			return null;
		}

		$tag_class = $tag_info['class'];

		return new $tag_class( [
			'settings' => $settings,
			'id' => $tag_id,
		] );
	}

	public function get_tag_data_content( $tag_id, $tag_name, array $settings = [] ) {
		$tag = $this->create_tag( $tag_id, $tag_name, $settings );

		return $tag->get_content();
	}

	public function get_tag_info( $tag_name ) {
		if ( ! $this->tags_info[ $tag_name ] ) {
			return null;
		}

		return $this->tags_info[ $tag_name ];
	}

	public function register_tag( $class ) {
		/** @var Tag $tag */
		$tag = new $class();

		$this->tags_info[ $tag->get_name() ] = [
			'class' => $class,
			'instance' => $tag,
		];
	}

	public function register_group( $group_name, array $group_settings ) {
		$default_group_settings = [
			'title' => '',
		];

		$group_settings = array_merge( $default_group_settings, $group_settings );

		$this->tags_groups[ $group_name ] = $group_settings;
	}

	public function print_templates() {
		foreach ( $this->tags_info as $tag_name => $tag_info ) {
			$tag = $tag_info['instance'];

			if ( ! $tag instanceof UI_Tag ) {
				continue;
			}

			$tag->print_template();
		}
	}

	public function get_tags_config() {
		$config = [];

		foreach ( $this->tags_info as $tag_name => $tag_info ) {
			/** @var Tag $tag */
			$tag = $tag_info['instance'];

			$config[ $tag_name ] = [
				'name' => $tag_name,
				'title' => $tag->get_title(),
				'mention_template' => $tag->get_mention_template(),
				'groups' => $tag->get_groups(),
				'controls' => $tag->get_controls(),
				'render_type' => $tag->get_config()['render_type'],
			];
		}

		return $config;
	}

	public function get_config() {
		return [
			'tags' => $this->get_tags_config(),
			'groups' => $this->tags_groups,
		];
	}

	public function ajax_render_tags() {
		Plugin::$instance->db->switch_to_post( $_POST['post_id'] );

		$tags_data = [];

		foreach ( $_POST['tags'] as $tag_key ) {
			$tag_key_parts = explode( '-', $tag_key );

			$tag_name = base64_decode( $tag_key_parts[0] );

			$tag_settings = json_decode( base64_decode( $tag_key_parts[1] ), true );

			$tag = $this->create_tag( null, $tag_name, $tag_settings );

			$tags_data[ $tag_key ] = $tag->get_content();
		}

		wp_send_json_success( $tags_data );
	}

	private function add_actions() {
		add_action( 'wp_ajax_elementor_render_tags', [ $this, 'ajax_render_tags' ] );
	}
}
