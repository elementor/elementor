<?php
namespace Elementor\System_Info\Classes;

use Elementor\System_Info\Classes\Abstracts\Base_Reporter;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Theme_Reporter extends Base_Reporter {

	/**
	 * @var \WP_Theme
	 */
	private $theme = null;

	/**
	 * @access public
	 * @since 1.0.0
	 */
	public function get_title() {
		return 'Theme';
	}

	/**
	 * @access public
	 * @since 1.0.0
	 */
	public function get_fields() {
		$fields = [
			'name' => 'Name',
			'version' => 'Version',
			'author' => 'Author',
			'is_child_theme' => 'Child Theme',
		];

		if ( $this->get_parent_theme() ) {
			$parent_fields = [
				'parent_name' => 'Parent Theme Name',
				'parent_version' => 'Parent Theme Version',
				'parent_author' => 'Parent Theme Author',
			];
			$fields = array_merge( $fields, $parent_fields );
		}

		return $fields;
	}

	/**
	 * @access protected
	 * @since 1.0.0
	 */
	protected function _get_theme() {
		if ( is_null( $this->theme ) ) {
			$this->theme = wp_get_theme();
		}
		return $this->theme;
	}

	/**
	 * @access protected
	 * @since 1.0.0
	 */
	protected function get_parent_theme() {
		return $this->_get_theme()->parent();
	}

	/**
	 * @access public
	 * @since 1.0.0
	 */
	public function get_name() {
		return [
			'value' => $this->_get_theme()->get( 'Name' ),
		];
	}

	/**
	 * @access public
	 * @since 1.0.0
	 */
	public function get_author() {
		return [
			'value' => $this->_get_theme()->get( 'Author' ),
		];
	}

	/**
	 * @access public
	 * @since 1.0.0
	 */
	public function get_version() {
		return [
			'value' => $this->_get_theme()->get( 'Version' ),
		];
	}

	/**
	 * @access public
	 * @since 1.0.0
	 */
	public function get_is_child_theme() {
		$is_child_theme = is_child_theme();

		$result = [
			'value' => $is_child_theme ? 'Yes' : 'No',
		];

		if ( ! $is_child_theme ) {
			$result['recommendation'] = sprintf(
				/* translators: %s: Codex URL */
				_x( 'If you want to modify the source code of your theme, we recommend using a <a href="%s">child theme</a>.', 'System Info', 'elementor' ),
				esc_url( 'https://codex.wordpress.org/Child_Themes' )
			);
		}

		return $result;
	}

	/**
	 * @access public
	 * @since 1.0.0
	 */
	public function get_parent_version() {
		return [
			'value' => $this->get_parent_theme()->get( 'Version' ),
		];
	}

	/**
	 * @access public
	 * @since 1.0.0
	 */
	public function get_parent_author() {
		return [
			'value' => $this->get_parent_theme()->get( 'Author' ),
		];
	}

	/**
	 * @access public
	 * @since 1.0.0
	 */
	public function get_parent_name() {
		return [
			'value' => $this->get_parent_theme()->get( 'Name' ),
		];
	}
}
