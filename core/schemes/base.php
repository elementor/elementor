<?php
namespace Elementor\Core\Schemes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor scheme base.
 *
 * An abstract class implementing the scheme interface, responsible for
 * creating new schemes.
 *
 * @since 1.0.0
 * @abstract
 */
abstract class Base {

	/**
	 * DB option name for the time when the scheme was last updated.
	 */
	const LAST_UPDATED_META = '_elementor_scheme_last_updated';

	const SCHEME_OPTION_PREFIX = 'elementor_scheme_';

	/**
	 * Get scheme type.
	 *
	 * Retrieve the scheme type.
	 *
	 * @since 2.8.0
	 * @access public
	 * @static
	 */
	public static function get_type() {
		return '';
	}

	/**
	 * Get default scheme.
	 *
	 * Retrieve the default scheme.
	 *
	 * @since 2.8.0
	 * @access public
	 */
	abstract public function get_default_scheme();

	/**
	 * Get description.
	 *
	 * Retrieve the scheme description.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 *
	 * @return string Scheme description.
	 */
	public static function get_description() {
		return '';
	}

	/**
	 * Get scheme value.
	 *
	 * Retrieve the scheme value.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array Scheme value.
	 */
	public function get_scheme_value() {
		$scheme_value = get_option( self::SCHEME_OPTION_PREFIX . static::get_type() );

		if ( ! $scheme_value ) {
			$scheme_value = $this->get_default_scheme();

			$this->update_scheme_option( $scheme_value, false );
		}

		return $scheme_value;
	}

	/**
	 * Save scheme.
	 *
	 * Update Elementor scheme in the database, and update the last updated
	 * scheme time.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param array $posted
	 */
	public function save_scheme( array $posted ) {
		$this->update_scheme_option( $posted );
	}

	/**
	 * Get scheme.
	 *
	 * Retrieve the scheme.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array The scheme.
	 */
	public function get_scheme() {
		$scheme = [];

		foreach ( $this->get_scheme_value() as $scheme_key => $scheme_value ) {
			$scheme[ $scheme_key ] = [
				'value' => $scheme_value,
			];
		}

		return $scheme;
	}

	private function update_scheme_option( $data, $should_update_timestamp = true ) {
		update_option( self::SCHEME_OPTION_PREFIX . static::get_type(), $data, false );

		if ( $should_update_timestamp ) {
			update_option( self::LAST_UPDATED_META, time() );
		}
	}
}
