<?php
namespace Elementor\Modules\DevTools;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Deprecation {
	const SOFT_VERSIONS_COUNT = 4;
	const HARD_VERSIONS_COUNT = 8;

	private $current_version = null;
	private $soft_deprecated_notices = [];

	public function __construct( $current_version ) {
		$this->current_version = $current_version;
	}

	public function get_settings() {
		return [
			'soft_notices' => $this->soft_deprecated_notices,
			'soft_version_count' => self::SOFT_VERSIONS_COUNT,
			'hard_version_count' => self::HARD_VERSIONS_COUNT,
			'current_version' => ELEMENTOR_VERSION,
		];
	}

	/**
	 * Get total of major.
	 *
	 * Since `get_total_major` cannot determine how much really versions between 2.9.0 and 3.3.0 if there is 2.10.0 version for example,
	 * versions with major2 more then 9 will be added to total.
	 *
	 * @since 3.1.0
	 *
	 * @param array $parsed_version
	 *
	 * @return int
	 */
	public function get_total_major( $parsed_version ) {
		$major1 = $parsed_version['major1'];
		$major2 = $parsed_version['major2'];
		$major2 = $major2 > 9 ? 9 : $major2;
		$minor = 0;

		$total = intval( "{$major1}{$major2}{$minor}" );

		if ( $total > 99 ) {
			$total = $total / 10;
		} else {
			$total = intval( $total / 10 );
		}

		if ( $parsed_version['major2'] > 9 ) {
			$total += $parsed_version['major2'] - 9;
		}

		return $total;
	}

	/**
	 * Get next version.
	 *
	 * @since 3.1.0
	 *
	 * @param string $version
	 * @param int $count
	 *
	 * @return string|false
	 */
	public function get_next_version( $version, $count = 1 ) {
		$version = $this->parse_version( $version );

		if ( ! $version ) {
			return false;
		}

		$version['total'] = $this->get_total_major( $version ) + $count;

		$total = $version['total'];

		if ( $total > 9 ) {
			$version['major1'] = intval( $total / 10 );
			$version['major2'] = $total % 10;
		} else {
			$version['major1'] = 0;
			$version['major2'] = $total;
		}

		$version['minor'] = 0;

		return $this->implode_version( $version );
	}

	/**
	 * Implode parsed version to string version.
	 *
	 * @since 3.1.0
	 *
	 * @param array $parsed_version
	 *
	 * @return string
	 */
	public function implode_version( $parsed_version ) {
		$major1 = $parsed_version['major1'];
		$major2 = $parsed_version['major2'];
		$minor = $parsed_version['minor'];

		return "{$major1}.{$major2}.{$minor}";
	}

	/**
	 * Parse to an informative array.
	 *
	 * @since 3.1.0
	 *
	 * @param string $version
	 *
	 * @return array|false
	 */
	public function parse_version( $version ) {
		$version_explode = explode( '.', $version );
		$version_explode_count = count( $version_explode );

		if ( $version_explode_count < 3 || $version_explode_count > 4 ) {
			trigger_error( 'Invalid Semantic Version string provided' . var_export( $version, 1 ) );

			return false;
		}

		list( $major1, $major2, $minor ) = $version_explode;

		$result = [
			'major1' => intval( $major1 ),
			'major2' => intval( $major2 ),
			'minor' => intval( $minor ),
		];

		if ( $version_explode_count > 3 ) {
			$result['build'] = $version_explode[3];
		}

		return $result;
	}

	/**
	 * Compare two versions, result is equal to diff of major versions.
	 * Notice: If you want to compare between 2.9.0 and 3.3.0, and there is also a 2.10.0 version, you cannot get the right comparison
	 * Since $this->deprecation->get_total_major cannot determine how much really versions between 2.9.0 and 3.3.0.
	 *
	 * @since 3.1.0
	 *
	 * @param {string} $version1
	 * @param {string} $version2
	 *
	 * @return int|false
	 */
	public function compare_version( $version1, $version2 ) {
		$version1 = self::parse_version( $version1 );
		$version2 = self::parse_version( $version2 );

		if ( $version1 && $version2 ) {
			$versions = [ &$version1, &$version2 ];

			foreach ( $versions as &$version ) {
				$version['total'] = self::get_total_major( $version );
			}

			return $version1['total'] - $version2['total'];
		}

		return false;
	}

	/**
	 * Check Deprecation
	 *
	 * Checks whether the given entity is valid. If valid, this method checks whether the deprecation
	 * should be soft (browser console notice) or hard (use WordPress' native deprecation methods).
	 *
	 * @since 3.1.0
	 *
	 * @param string $entity - The Deprecated entity (the function/hook itself)
	 * @param string $version
	 * @param string $replacement Optional
	 * @param string $base_version Optional. Default is `null`
	 *
	 * @return array
	 * @throws \Exception
	 */
	private function check_deprecation( $entity, $version, $replacement, $base_version = null ) {
		if ( null === $base_version ) {
			$base_version = $this->current_version;
		}

		$diff = $this->compare_version( $base_version, $version );

		if ( false === $diff ) {
			throw new \Exception( 'Invalid deprecation diff.' );
		}

		$print_deprecated = array();

		if ( $this->should_print_deprecated( $version, $base_version ) || $this->should_console_log_deprecated() ) {
			$backtrace = debug_backtrace( DEBUG_BACKTRACE_IGNORE_ARGS );

			$external_sources = $this->find_third_party_sources( $backtrace );

			$source_message = 'Elementor';
			$plugin_name = 'unknown';
			if ( ! ( empty( $external_sources ) ) ) {
				$calling_source = $external_sources[ array_key_first( $external_sources ) ];
				$plugin_name = $this->get_plugin_name( $calling_source['file'] );
				if ( empty( $plugin_name ) ) {
					$plugin_name = 'unknown';
				}
				$source_message = sprintf( '%s on file %s:%d.', $calling_source['function'], $calling_source['file'], $calling_source['line'] );
			}
			if ( $this->should_console_log_deprecated() ) {
				// Soft deprecated.
				if ( ! isset( $this->soft_deprecated_notices[ $entity ] ) ) {
					$this->soft_deprecated_notices[ $entity ] = [
						$version,
						$replacement,
						$source_message,
					];
				}
			}

			if ( $this->should_print_deprecated( $version, $base_version ) ) {
				$print_deprecated = [
					'source' => $source_message,
					'plugin' => $plugin_name,
				];
			}
		}
		return $print_deprecated;
	}

	private function get_plugin_name( $filename ) {
		$plugin_path = substr( strstr( $filename, WP_PLUGIN_DIR ), strlen( WP_PLUGIN_DIR ) );
		if ( empty( $plugin_path ) ) {
			return '';
		}
		$plugin_name = explode( '/', $plugin_path )[1];
		return $plugin_name;
	}

	private function is_elementor_file( $stack_element ) {
		$filename = $stack_element['file'];
		return ( strpos( $filename, 'elementor/' ) !== false || strpos( $filename, 'elementor-pro/' ) !== false );
	}

	private function is_plugin( $stack_element ) {
		$filename = $stack_element['file'];
		if ( strpos( $filename, WP_PLUGIN_DIR ) !== false ) {
			return true;
		}
		return false;

	}

	private function find_third_party_sources( $stack_trace ) {
		$sources = array_filter($stack_trace, function ( $elem ) {
			return ( ! ( $this->is_elementor_file( ( $elem ) ) ) ) && $this->is_plugin( $elem );
		} );
		return $sources;
	}

	/**
	 * Checks whether deprecation message should be printed.
	 * If the user is logged in and has admin privileges, the message will be printed.
	 * If the user is not logged in, the message will be printed only if the user has WP_DEBUG enabled.
	 * If the user is logged in but does not have admin privileges, the message will be printed only if the user has ELEMENTOR_DEBUG enabled.
	 *
	 *
	 * @param  mixed $version
	 * @param  mixed $base_version
	 * @return bool
	 */
	private function should_print_deprecated( $version, $base_version ) {

		$elementor_debug = ( defined( 'ELEMENTOR_DEBUG' ) && ELEMENTOR_DEBUG );
		$wp_debug = ( defined( 'WP_DEBUG' ) && WP_DEBUG );
		$user_is_admin = current_user_can( 'manage_options' );
		$user_is_logged_in = is_user_logged_in();

		if ( null === $base_version ) {
			$base_version = $this->current_version;
		}
		$first_deprecation_stage = $this->compare_version( $base_version, $version ) <= self::SOFT_VERSIONS_COUNT;

		if ( $wp_debug ) {
			if ( $elementor_debug ) {
				return true;
			}
			if ( $user_is_admin ) {
				return true;
			}
			if ( $user_is_logged_in && ! $first_deprecation_stage ) {
				return true;
			}
		}

		return false;

	}

	private function should_console_log_deprecated() {
		return ( defined( 'WP_DEBUG' ) && WP_DEBUG );
	}

	private function notify_deprecated_function( $function_name, $version, $replacement = '', $calling_plugin = '', $call_location = '' ) {

		/**
		 * Fires when a deprecated function is called.
		 *
		 * @since 2.5.0
		 *
		 * @param string $function_name The function that was called.
		 * @param string $replacement   The function that should have been called.
		 * @param string $version       The version of WordPress that deprecated the function.
		 */
		do_action( 'deprecated_function_run', $function_name, $replacement, $version );

		/**
		 * Filters whether to trigger an error for deprecated functions.
		 *
		 * @since 2.5.0
		 *
		 * @param bool $trigger Whether to trigger the error for deprecated functions. Default true.
		 */
		if ( apply_filters( 'deprecated_function_trigger_error', true ) ) {
			$message_string = __( '' );
			$error_message_args = [ esc_html( $function_name ), esc_html( $version ) ];
			if ( $replacement ) {
				$error_message_args[] = $replacement;
				$message_string = __( 'Function %1$s is <strong>deprecated</strong> since version %2$s! Use %3$s instead. Caller plugin: %4$s. Called from: %5$s.', 'elementor' );
			} else {
				$message_string = __( 'Function %1$s is <strong>deprecated</strong> since version %2$s with no alternative available. Caller plugin: %3$s. Called from: %4$s.', 'elementor' );
			}
			$error_message_args[] = $calling_plugin;
			$error_message_args[] = $call_location;
			trigger_error(
				vsprintf(
					// PHPCS - $message_string is already escaped above.
					$message_string, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
					$error_message_args // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				),
				E_USER_DEPRECATED
			);
		}
	}
	private function notify_deprecated_argument( $argument, $version, $replacement = '', $message = '', $plugin, $source ) {


		do_action( 'deprecated_argument_run', $function_name, $message, $version );

		$message = empty( $message ) ? '' : ' ' . $message;
		// These arguments are escaped because they are printed later, and are not escaped when printed.
		$error_message_args = [ esc_html( $argument ), esc_html( $version ) ];

		if ( $replacement ) {
			/* translators: 1: Function argument, 2: Elementor version number, 3: Replacement argument name. */
			$translation_string = __( 'The %1$s argument is <strong>deprecated</strong> since version %2$s! Use %3$s instead. Caller plugin: %4$s. Called from: %5$s.', 'elementor' );
			$error_message_args[] = $replacement;
		} else {
			/* translators: 1: Function argument, 2: Elementor version number. */
			$translation_string = __( 'The %1$s argument is <strong>deprecated</strong> since version %2$s! Caller plugin: %3$s. Called from: %4$s.', 'elementor' );
		}
		$error_message_args[] = $plugin;
		$error_message_args[] = $source;

		trigger_error(
			vsprintf(
				// PHPCS - $translation_string is already escaped above.
				$translation_string,  // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				// PHPCS - $error_message_args is an array.
				$error_message_args  // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			) . esc_html( $message ),
			E_USER_DEPRECATED
		);
	}

	/**
	 * Deprecated Function
	 *
	 * Handles the deprecation process for functions
	 *
	 * @since 3.1.0
	 *
	 * @param string $function
	 * @param string $version
	 * @param string $replacement Optional. Default is ''
	 * @param string $base_version Optional. Default is `null`
	 * @throws \Exception
	 */
	public function deprecated_function( $function, $version, $replacement = '', $base_version = null, $debug_mode = false ) {

		$print_deprecated = $this->check_deprecation( $function, $version, $replacement, $base_version );

		if ( ! empty( $print_deprecated ) ) {
			// PHPCS - We need to echo special characters because they can exist in function calls.
			$this->notify_deprecated_function( $function, esc_html( $version ), $replacement, $print_deprecated['plugin'], $print_deprecated['source'] );
		}
	}


	/**
	 * Deprecated Hook
	 *
	 * Handles the deprecation process for hooks.
	 *
	 * @since 3.1.0
	 *
	 * @param string $hook
	 * @param string $version
	 * @param string $replacement Optional. Default is ''
	 * @param string $base_version Optional. Default is `null`
	 * @throws \Exception
	 */
	public function deprecated_hook( $hook, $version, $replacement = '', $base_version = null ) {

		$print_deprecated = $this->check_deprecation( $hook, $version, $replacement, $base_version );
		if ( ! empty( $print_deprecated ) ) {
			$message = sprintf( 'Caller plugin: %1$s. Called from: %2$s.', $print_deprecated['plugin'], $print_deprecated['source'] );
			_deprecated_hook( esc_html( $hook ), esc_html( $version ), esc_html( $replacement ), $message );
		}
	}

	/**
	 * Deprecated Argument
	 *
	 * Handles the deprecation process for function arguments.
	 *
	 * @since 3.1.0
	 *
	 * @param string $argument
	 * @param string $version
	 * @param string $replacement
	 * @param string $message
	 * @throws \Exception
	 */
	public function deprecated_argument( $argument, $version, $replacement = '', $message = '' ) {
		$print_deprecated = $this->check_deprecation( $argument, $version, $replacement );

		if ( ! empty( $print_deprecated ) ) {
			$this->notify_deprecated_argument( $argument, $version, $replacement, $message, $print_deprecated['plugin'], $print_deprecated['source'] );
		}
	}

	/**
	 * Do Deprecated Action
	 *
	 * A method used to run deprecated actions through Elementor's deprecation process.
	 *
	 * @since 3.1.0
	 *
	 * @param string $hook
	 * @param array $args
	 * @param string $version
	 * @param string $replacement
	 * @param null|string $base_version
	 *
	 * @throws \Exception
	 */
	public function do_deprecated_action( $hook, $args, $version, $replacement = '', $base_version = null ) {
		if ( ! has_action( $hook ) ) {
			return;
		}

		$this->deprecated_hook( $hook, $version, $replacement, $base_version );

		do_action_ref_array( $hook, $args );
	}


	/**
	 * Apply Deprecated Filter
	 *
	 * A method used to run deprecated filters through Elementor's deprecation process.
	 *
	 * @since 3.2.0
	 *
	 * @param string $hook
	 * @param array $args
	 * @param string $version
	 * @param string $replacement
	 * @param null|string $base_version
	 *
	 * @return mixed
	 * @throws \Exception
	 */
	public function apply_deprecated_filter( $hook, $args, $version, $replacement = '', $base_version = null ) {
		if ( ! has_action( $hook ) ) {
			// `$args` should be an array, but in order to keep BC, we need to support non-array values.
			if ( is_array( $args ) ) {
				return $args[0] ?? null;
			}

			return $args;
		}

		// BC - See the comment above.
		if ( ! is_array( $args ) ) {
			$args = [ $args ];
		}

		// Avoid associative arrays.
		$args = array_values( $args );
		$this->deprecated_hook( $hook, $version, $replacement, $base_version );
		return apply_filters_ref_array( $hook, $args );
	}
}
