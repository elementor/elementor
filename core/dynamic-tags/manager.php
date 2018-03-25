<?php
namespace Elementor\Core\DynamicTags;

use Elementor\Plugin;
use Elementor\User;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Manager {

	const TAG_LABEL = 'elementor-tag';

	const MODE_RENDER = 'render';

	const MODE_REMOVE = 'remove';

	const DYNAMIC_SETTING_KEY = '__dynamic__';

	private $tags_groups = [];

	private $tags_info = [];

	private $parsing_mode = self::MODE_RENDER;

	public function __construct() {
		$this->add_actions();
	}

	public function parse_tags_text( $text, array $settings, callable $parse_callback ) {
		if ( ! empty( $settings['returnType'] ) && 'object' === $settings['returnType'] ) {
			$value = $this->parse_tag_text( $text, $settings, $parse_callback );
		} else {

			$value = preg_replace_callback( '/\[' . self::TAG_LABEL . '.+?(?=\])\]/', function( $tag_text_match ) use ( $settings, $parse_callback ) {
				return $this->parse_tag_text( $tag_text_match[0], $settings, $parse_callback );
			}, $text );
		}

		return $value;
	}

	public function parse_tag_text( $tag_text, array $settings, $parse_callback ) {
		$tag_data = $this->tag_text_to_tag_data( $tag_text );

		if ( ! $tag_data ) {
			if ( ! empty( $settings['returnType'] ) && 'object' === $settings['returnType'] ) {
				return [];
			}

			return '';
		}

		return call_user_func_array( $parse_callback, $tag_data );
	}

	public function tag_text_to_tag_data( $tag_text ) {
		preg_match( '/id="(.*?(?="))"/', $tag_text, $tag_id_match );
		preg_match( '/name="(.*?(?="))"/', $tag_text, $tag_name_match );
		preg_match( '/settings="(.*?(?="]))/', $tag_text, $tag_settings_match );

		if ( ! $tag_id_match || ! $tag_name_match || ! $tag_settings_match ) {
			return null;
		}

		return [
			'id' => $tag_id_match[1],
			'name' => $tag_name_match[1],
			'settings' => json_decode( urldecode( $tag_settings_match[1] ), true ),
		];
	}

	/**
	 * @param Base_Tag $tag
	 *
	 * @return string
	 */
	public function tag_to_text( Base_Tag $tag ) {
		return sprintf( '[%1$s id="%2$s" name="%3$s" settings="%4$s"]', self::TAG_LABEL, $tag->get_id(), $tag->get_name(), urlencode( wp_json_encode( $tag->get_settings(), JSON_FORCE_OBJECT ) ) );
	}

	/**
	 * @param string $tag_id
	 * @param string $tag_name
	 * @param array  $settings
	 *
	 * @return string
	 */
	public function tag_data_to_tag_text( $tag_id, $tag_name, array $settings = [] ) {
		$tag = $this->create_tag( $tag_id, $tag_name, $settings );

		if ( ! $tag ) {
			return '';
		}

		return $this->tag_to_text( $tag );
	}

	/**
	 * @param string $tag_id
	 * @param string $tag_name
	 * @param array  $settings
	 *
	 * @return Tag|null
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
		if ( self::MODE_REMOVE === $this->parsing_mode ) {
			return null;
		}

		$tag = $this->create_tag( $tag_id, $tag_name, $settings );

		if ( ! $tag ) {
			return null;
		}

		return $tag->get_content( [
			'wrap' => true,
		] );
	}

	public function get_tag_info( $tag_name ) {
		if ( empty( $this->tags_info[ $tag_name ] ) ) {
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

			if ( ! $tag instanceof Tag ) {
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

			ob_start();

			$tag->print_panel_template();

			$panel_template = ob_get_clean();

			$config[ $tag_name ] = [
				'name' => $tag_name,
				'title' => $tag->get_title(),
				'panel_template' => $panel_template,
				'categories' => $tag->get_categories(),
				'group' => $tag->get_group(),
				'controls' => $tag->get_controls(),
				'content_type' => $tag->get_content_type(),
				'settings_required' => $tag->is_settings_required(),
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
		Plugin::$instance->editor->verify_ajax_nonce();

		$posted = $_POST; // WPCS: CSRF OK.

		if ( empty( $posted['post_id'] ) ) {
			throw new \Exception( 'Missing post id.' );
		}

		if ( ! User::is_current_user_can_edit( $posted['post_id'] ) ) {
			throw new \Exception( 'Access denied.' );
		}

		Plugin::$instance->db->switch_to_post( $posted['post_id'] );

		/**
		 * Before dynamic tags rendered.
		 *
		 * Fires before Elementor renders the dynamic tags.
		 *
		 * @since 2.0.0
		 */
		do_action( 'elementor/dynamic_tags/before_render' );

		$tags_data = [];

		foreach ( $posted['tags'] as $tag_key ) {
			$tag_key_parts = explode( '-', $tag_key );

			$tag_name = base64_decode( $tag_key_parts[0] );

			$tag_settings = json_decode( urldecode( base64_decode( $tag_key_parts[1] ) ), true );

			$tag = $this->create_tag( null, $tag_name, $tag_settings );

			$tags_data[ $tag_key ] = $tag->get_content();
		}

		/**
		 * After dynamic tags rendered.
		 *
		 * Fires after Elementor renders the dynamic tags.
		 *
		 * @since 2.0.0
		 */
		do_action( 'elementor/dynamic_tags/after_render' );

		wp_send_json_success( $tags_data );
	}

	public function set_parsing_mode( $mode ) {
		$this->parsing_mode = $mode;
	}

	public function get_parsing_mode() {
		return $this->parsing_mode;
	}

	private function add_actions() {
		add_action( 'wp_ajax_elementor_render_tags', [ $this, 'ajax_render_tags' ] );
	}
}
