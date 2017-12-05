<?php
namespace Elementor\Core\MicroElements;

use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Manager {

	const TAG_LABEL = 'elementor-tag';

	private static $tags_groups = [];

	private static $tags_info = [];

	public static function parse_tags_text( $text ) {
		return preg_replace_callback( '/\[' . self::TAG_LABEL . '.+?(?=\])\]/', function( $tag_text_match ) {
			return self::parse_tag_text( $tag_text_match[0] );
		}, $text );
	}

	public static function parse_tag_text( $tag_text ) {
		preg_match( '/id="(.+?(?="))"/', $tag_text, $tag_id_match );

		preg_match( '/name="(.+?(?="))"/', $tag_text, $tag_name_match );

		preg_match( '/settings="(.+?(?="]))/', $tag_text, $tag_settings_match );

		if ( ! $tag_id_match || ! $tag_name_match || ! $tag_settings_match ) {
			return '';
		}

		$tag_id = $tag_id_match[1];

		$tag_name = $tag_name_match[1];

		$tag_settings = json_decode( $tag_settings_match[1], true );

		$tag = self::create_tag( $tag_id, $tag_name, $tag_settings );

		return $tag->get_content();
	}

	/**
	 * @param string $tag_id
	 * @param string $tag_name
	 * @param array  $settings
	 *
	 * @return Base_Tag
	 */
	public static function create_tag( $tag_id, $tag_name, array $settings = [] ) {
		$tag_class = self::get_tag_info( $tag_name )['class'];

		return new $tag_class( [
			'settings' => $settings,
			'id' => $tag_id,
		] );
	}

	public static function get_tag_info( $tag_name ) {
		if ( ! self::$tags_info[ $tag_name ] ) {
			return null;
		}

		return self::$tags_info[ $tag_name ];
	}

	public static function register_tag( $class ) {
		/** @var Base_Tag $tag */
		$tag = new $class();

		self::$tags_info[ $tag->get_name() ] = [
			'class' => $class,
			'instance' => $tag,
		];

		self::add_editor_template( $tag );
	}

	public static function register_group( $group_name, array $group_settings ) {
		$default_group_settings = [
			'title' => '',
		];

		$group_settings = array_merge( $default_group_settings, $group_settings );

		self::$tags_groups[ $group_name ] = $group_settings;
	}

	public static function add_editor_template( Base_Tag $tag ) {
		ob_start();

		$tag->print_template();

		Plugin::$instance->editor->add_editor_template( ob_get_clean(), 'text' );
	}

	public static function get_tags_config() {
		$config = [];

		foreach ( self::$tags_info as $tag_name => $tag_info ) {
			/** @var Base_Tag $tag */
			$tag = $tag_info['instance'];

			$config[ $tag_name ] = [
				'name' => $tag_name,
				'title' => $tag->get_title(),
				'mention_template' => $tag->get_mention_template(),
				'group' => $tag->get_group(),
				'controls' => $tag->get_controls(),
			];
		}

		return $config;
	}

	public static function get_config() {
		return [
			'tags' => self::get_tags_config(),
			'groups' => self::$tags_groups,
		];
	}
}
