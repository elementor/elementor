<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Form;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Form_Action_Url_Prop_Type extends String_Prop_Type {
	public const KIND_REDIRECT = 'redirect';

	public const KIND_WEBHOOK = 'webhook';

	private const REDIRECT_SCHEMES = [ 'http', 'https', 'ftp', 'ftps' ];

	private const WEBHOOK_SCHEMES = [ 'http', 'https' ];

	private const FIELD_SHORTCODE_PATTERN = '/\[field\b[^\[\]]*\]/';

	private string $kind = self::KIND_REDIRECT;

	public static function get_key(): string {
		return 'string';
	}

	public static function redirect(): self {
		$prop_type = new self();
		$prop_type->kind = self::KIND_REDIRECT;

		return $prop_type;
	}

	public static function webhook(): self {
		$prop_type = new self();
		$prop_type->kind = self::KIND_WEBHOOK;

		return $prop_type;
	}

	protected function validate_value( $value ): bool {
		if ( ! is_string( $value ) ) {
			return false;
		}

		return self::KIND_WEBHOOK === $this->kind
			? self::is_webhook_url( $value )
			: self::is_redirect_url( $value );
	}

	private static function is_redirect_url( string $value ): bool {
		$url = self::split_absolute_url( $value );

		if ( null === $url || ! in_array( $url['scheme'], self::REDIRECT_SCHEMES, true ) ) {
			return false;
		}

		if ( self::contains_field_shortcode( $url['authority'] ) || ! self::is_authority( $url['authority'], true ) ) {
			return false;
		}

		return self::is_redirect_rest( $url['rest'] );
	}

	/**
	 * Shape check only. Webhook_Action still refuses hosts that wp_http_validate_url() rejects,
	 * including private addresses. Calling that here would DNS-resolve the host on every save.
	 */
	private static function is_webhook_url( string $value ): bool {
		$url = self::split_absolute_url( $value );

		if ( null === $url || ! in_array( $url['scheme'], self::WEBHOOK_SCHEMES, true ) ) {
			return false;
		}

		if ( false !== strpos( $url['authority'], '@' ) || ! self::is_authority( $url['authority'], false ) ) {
			return false;
		}

		return self::is_plain_rest( $url['rest'] );
	}

	private static function split_absolute_url( string $value ): ?array {
		if ( ! preg_match( '~^([a-z][a-z0-9+.-]*)://([^/?#]*)(.*)$~i', $value, $matches ) ) {
			return null;
		}

		return [
			'scheme' => strtolower( $matches[1] ),
			'authority' => $matches[2],
			'rest' => $matches[3],
		];
	}

	private static function is_authority( string $authority, bool $allow_ipv6 ): bool {
		if ( '' === $authority || preg_match( '/[\s<>]/', $authority ) ) {
			return false;
		}

		$host = $authority;
		$at = strrpos( $authority, '@' );

		if ( false !== $at ) {
			$userinfo = substr( $authority, 0, $at );
			$host = substr( $authority, $at + 1 );

			if ( '' === $userinfo || '' === $host || preg_match( '/[\[\]]/', $userinfo ) ) {
				return false;
			}
		}

		if ( 0 === strpos( $host, '[' ) ) {
			if ( ! $allow_ipv6 || ! preg_match( '/^\[([^\[\]]+)\](?::(\d+))?$/', $host, $matches ) ) {
				return false;
			}

			return '' !== $matches[1];
		}

		if ( preg_match( '/[\[\]]/', $host ) ) {
			return false;
		}

		$port_separator = strrpos( $host, ':' );

		if ( false !== $port_separator ) {
			$port = substr( $host, $port_separator + 1 );
			$host = substr( $host, 0, $port_separator );

			if ( '' === $port || ! ctype_digit( $port ) ) {
				return false;
			}
		}

		return '' !== $host && ! preg_match( '/[\s\/?#@]/', $host );
	}

	private static function is_redirect_rest( string $rest ): bool {
		if ( '' === $rest ) {
			return true;
		}

		if ( ! self::rest_starts_with_separator( $rest ) ) {
			return false;
		}

		$without_shortcodes = preg_replace( self::FIELD_SHORTCODE_PATTERN, '', $rest );

		return is_string( $without_shortcodes ) && self::is_plain_rest( $without_shortcodes );
	}

	private static function is_plain_rest( string $rest ): bool {
		if ( '' === $rest ) {
			return true;
		}

		return self::rest_starts_with_separator( $rest ) && ! preg_match( '/[\s\[\]]/', $rest );
	}

	private static function rest_starts_with_separator( string $rest ): bool {
		return in_array( $rest[0], [ '/', '?', '#' ], true );
	}

	private static function contains_field_shortcode( string $value ): bool {
		return 1 === preg_match( self::FIELD_SHORTCODE_PATTERN, $value );
	}
}
