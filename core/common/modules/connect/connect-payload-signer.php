<?php
namespace Elementor\Core\Common\Modules\Connect;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Connect_Payload_Signer {

	private const SIGNATURE_ALGORITHM = 'sha256';

	public static function sign( array $payload, string $secret ) {
		return hash_hmac(
			self::SIGNATURE_ALGORITHM,
			wp_json_encode( $payload, JSON_NUMERIC_CHECK ),
			$secret
		);
	}
}
