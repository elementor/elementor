<?php
namespace Elementor\Core\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Force translation to use a specific locale.
 *
 * A hacky class to force any translation functions in the call-stack between the
 * `force()` & `reset()` methods to use a specific locale.
 */
class Force_Locale {

	private $new_locale;

	private $filter;

	private $original_locale;

	public function __construct( $new_locale ) {
		$this->new_locale = $new_locale;

		$this->original_locale = determine_locale();

		$this->filter = function() use ( $new_locale ) {
			return $new_locale;
		};
	}

	public function force() {
		switch_to_locale( $this->new_locale );

		/**
		 * Reset l10n in order to clear the translations cache.
		 *
		 * @see https://github.com/WordPress/wordpress-develop/blob/2437ef5130f10153bc4fffa412d4f37e65e3d66b/src/wp-includes/l10n.php#L1324
		 * @see https://github.com/WordPress/wordpress-develop/blob/2437ef5130f10153bc4fffa412d4f37e65e3d66b/src/wp-includes/l10n.php#L1222
		 * @see https://github.com/WordPress/wordpress-develop/blob/2437ef5130f10153bc4fffa412d4f37e65e3d66b/src/wp-includes/l10n.php#L821
		 */
		$this->reset_l10n();

		/**
		 * Force the translations of `$new_locale` to be loaded.
		 *
		 * @see https://github.com/WordPress/wordpress-develop/blob/2437ef5130f10153bc4fffa412d4f37e65e3d66b/src/wp-includes/l10n.php#L1294
		 */
		add_filter( 'pre_determine_locale', $this->filter );
	}

	public function reset() {
		remove_filter( 'pre_determine_locale', $this->filter );

		$this->reset_l10n();

		switch_to_locale( $this->original_locale );
	}

	private function reset_l10n() {
		global $l10n_unloaded;

		if ( is_array( $l10n_unloaded ) ) {
			foreach ( $l10n_unloaded as $domain => $l10n_unloaded_data ) {
				unset( $l10n_unloaded[ $domain ] );
			}
		}
	}
}
