<?php
namespace Elementor\Modules\DevTools;

use Elementor\Modules\DevTools\Backtrace_Helper;

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
			// phpcs:disable WordPress.PHP.DevelopmentFunctions		
			trigger_error( 'Invalid Semantic Version string provided: ' . esc_html( var_export( $version, 1 ) ) );
			// phpcs:enable

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
	 * @since 3.15.0
	 *
	 * @param string $entity - The Deprecated entity (the function/hook itself)
	 * @param string $version
	 * @param string $replacement Optional
	 * @param string $stack_depth Optional. Default is 3. Change if calling functions depth changes.
	 *
	 * @return array
	 */
	private function get_deprecation_info( $entity, $version, $replacement, $stack_depth = 3 ) {

		$calling_source = Backtrace_Helper::find_who_called_me( $stack_depth );

		$deprecation_info = [
			'entity' => $entity,
			'version' => $version,
			'replacement' => $replacement,
			'calling_function' => $calling_source['function'] ?? '',
			'calling_file' => $calling_source['file'] ?? '',
			'calling_line' => $calling_source['line'] ?? '',
			'calling_plugin' => $calling_source['name'] ?? '',
			'calling_type' => $calling_source['type'] ?? '',
		];
		return $deprecation_info;
	}

	private function log_deprecation( $deprecation_object ) {
		if ( empty( $deprecation_object['entity'] ) || ! $this->should_console_log_deprecated() ) {
			return;
		}

		if ( ! isset( $this->soft_deprecated_notices[ $deprecation_object['entity'] ] ) ) {
			$source_message = $this->create_location_message( $deprecation_object['calling_function'], $deprecation_object['calling_file'], $deprecation_object['calling_line'] );
			$this->soft_deprecated_notices[ $deprecation_object['entity'] ] = [
				$deprecation_object['version'],
				$deprecation_object['replacement'],
				$source_message,
			];
		}

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
		$is_elementor_debug = defined( 'ELEMENTOR_DEBUG' ) && ELEMENTOR_DEBUG;
		$is_wp_debug = defined( 'WP_DEBUG' ) && WP_DEBUG;
		$user_is_admin = current_user_can( 'manage_options' );
		$user_is_logged_in = is_user_logged_in();

		if ( $is_wp_debug ) {
			if ( $is_elementor_debug ) {
				return true;
			}
			if ( $user_is_admin ) {
				return true;
			}
			if ( $user_is_logged_in && ! $this->is_first_deprecation_stage( $version, $base_version ) ) {
				return true;
			}
		}
		return false;
	}

	private function is_first_deprecation_stage( $version, $base_version ) {
		if ( null === $base_version ) {
			$base_version = $this->current_version;
		}
		$diff = $this->compare_version( $base_version, $version );
		if ( false === $diff ) {
			throw new \Exception( 'Invalid deprecation diff.' );
		}
		$first_deprecation_stage = $diff <= self::SOFT_VERSIONS_COUNT;
		return $first_deprecation_stage;
	}

	private function should_console_log_deprecated() {
		return defined( 'WP_DEBUG' ) && WP_DEBUG;
	}

	private function should_collect_deprication_info( $version, $base_version ) {
		return $this->should_print_deprecated( $version, $base_version ) || $this->should_console_log_deprecated();
	}

	private function notify_deprecated_function( $deprecation_object ) {
		/**
		 * Fires when a deprecated function is called.
		 *
		 * @since 2.5.0
		 *
		 * @param string $function_name The function that was called.
		 * @param string $replacement   The function that should have been called.
		 * @param string $version       The version of WordPress that deprecated the function.
		 */
		do_action( 'deprecated_function_run', $deprecation_object['entity'], $deprecation_object['replacement'], $deprecation_object['version'] );

		$source = $this->create_location_message( $deprecation_object['calling_function'], $deprecation_object['calling_file'], $deprecation_object['calling_line'] );

		/**
		 * Filters whether to trigger an error for deprecated functions.
		 *
		 * @since 2.5.0
		 *
		 * @param bool $trigger Whether to trigger the error for deprecated functions. Default true.
		 */
		if ( apply_filters( 'deprecated_function_trigger_error', true ) ) {
			$message_string = '';
			if ( ! empty( $deprecation_object['replacement'] ) ) {
				$message_string = sprintf( __( 'Function %1$s is <strong>deprecated</strong> since version %2$s! Use %3$s instead. Caller %4$s: %5$s. Called from: %6$s.', 'elementor' ),
					$deprecation_object['entity'],
					$deprecation_object['version'],
					$deprecation_object['replacement'],
					$deprecation_object['calling_type'],
					$deprecation_object['calling_plugin'],
					$source
				);
			} else {
				$message_string = sprintf(__( 'Function %1$s is <strong>deprecated</strong> since version %2$s with no alternative available. Caller %3$s: %4$s. Called from: %5$s.', 'elementor' ),
					$deprecation_object['entity'],
					$deprecation_object['version'],
					$deprecation_object['calling_type'],
					$deprecation_object['calling_plugin'],
					$source
				);
			}
			$this->trigger_wp_error( $message_string );
		}
	}

	private function notify_deprecated_argument( $deprecation_object, $message = '' ) {
		do_action( 'deprecated_argument_run', $deprecation_object['entity'], $message, $deprecation_object['version'] );

		$message = empty( $message ) ? '' : ' ' . $message;
		$caller_location_message = $this->create_location_message( $deprecation_object['calling_function'], $deprecation_object['calling_file'], $deprecation_object['calling_line'] );

		if ( ! empty( $deprecation_object['replacement'] ) ) {
			/* translators: 1: Function argument, 2: Elementor version number, 3: Replacement argument name. */
			$translation_string = sprintf(__( 'The %1$s argument is <strong>deprecated</strong> since version %2$s! Use %3$s instead. Caller %4$s: %5$s. Called from: %6$s.', 'elementor' ),
				$deprecation_object['entity'],
				$deprecation_object['version'],
				$deprecation_object['replacement'],
				$deprecation_object['calling_type'],
				$deprecation_object['calling_plugin'],
				$caller_location_message
			) . $message;

		} else {
			/* translators: 1: Function argument, 2: Elementor version number. */
			$translation_string = sprintf(__( 'The %1$s argument is <strong>deprecated</strong> since version %2$s! Caller %3$s: %4$s. Called from: %5$s.', 'elementor' ),
				$deprecation_object['entity'],
				$deprecation_object['version'],
				$deprecation_object['calling_type'],
				$deprecation_object['calling_plugin'],
				$caller_location_message
			) . $message;

		}
		$this->trigger_wp_error( $translation_string );

	}

	private function create_location_message( $function, $file, $line ) {
		return sprintf( '%s on file %s:%d.', $function, $file, $line );
	}

	private function trigger_wp_error( $message ) {
		// phpcs:disable WordPress.PHP.DevelopmentFunctions
		trigger_error( wp_kses_post( $message ), E_USER_DEPRECATED );
		// phpcs:enable
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
	public function deprecated_function( $function, $version, $replacement = '', $base_version = null ) {

		if ( null === $base_version ) {
			$base_version = $this->current_version;
		}
		if ( ! $this->should_collect_deprication_info( $version, $base_version ) ) {
			return;
		}
		$deprecation_info = $this->get_deprecation_info( $function, $version, $replacement );

		if ( ! empty( $deprecation_info ) ) {
			$this->log_deprecation( $deprecation_info );

			if ( $this->should_print_deprecated( $version, $base_version ) ) {
				$this->notify_deprecated_function( $deprecation_info );
			}
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
		if ( null === $base_version ) {
			$base_version = $this->current_version;
		}

		if ( ! $this->should_collect_deprication_info( $version, $base_version ) ) {
			return;
		}

		$deprecation_info = $this->get_deprecation_info( $hook, $version, $replacement );
		if ( ! empty( $deprecation_info ) ) {
			$this->log_deprecation( $deprecation_info );
			if ( $this->should_print_deprecated( $version, $base_version ) ) {
				$this->notify_deprecated_hook( $deprecation_info );
			}
		}
	}


	private function notify_deprecated_hook( $deprecation_object ) {
		$message = $this->create_location_message( $deprecation_object['calling_function'], $deprecation_object['calling_file'], $deprecation_object['calling_line'] );
		_deprecated_hook( esc_html( $deprecation_object['entity'] ), esc_html( $deprecation_object['version'] ), esc_html( $deprecation_object['replacement'] ), esc_html( $message ) );
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
		$base_version = $this->current_version;

		if ( ! $this->should_collect_deprication_info( $version, $base_version ) ) {
			return;
		}

		$deprecation_info = $this->get_deprecation_info( $argument, $version, $replacement );

		if ( ! empty( $deprecation_info ) ) {
			$this->log_deprecation( $deprecation_info );

			if ( $this->should_print_deprecated( $version, $base_version ) ) {
				$this->notify_deprecated_argument( $deprecation_info, $message );
			}
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
		if ( null === $base_version ) {
			$base_version = $this->current_version;
		}

		if ( ! $this->should_collect_deprication_info( $version, $base_version ) ) {
			return;
		}

		$deprecation_info = $this->get_deprecation_info( $hook, $version, $replacement );
		if ( ! empty( $deprecation_info ) ) {
			$this->log_deprecation( $deprecation_info );
			if ( $this->should_print_deprecated( $version, $base_version ) ) {
				$this->notify_deprecated_hook( $deprecation_info );
			}
		}

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
