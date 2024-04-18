<?php

namespace Elementor\Modules\ConversionCenter\Classes\Providers;

class Social_Network_Provider {

	private static array $social_networks = [];

	public const FACEBOOK = 'Facebook';
	public const TWITTER = 'X (Twitter)';
	public const INSTAGRAM = 'Instagram';
	public const LINKEDIN = 'LinkedIn';
	public const PINTEREST = 'Pinterest';
	public const YOUTUBE = 'YouTube';
	public const TIKTOK = 'TikTok';
	public const WHATSAPP = 'WhatsApp';
	public const APPLEMUSIC = 'Apple Music';
	public const SPOTIFY = 'Spotify';
	public const SOUNDCLOUD = 'SoundCloud';
	public const BEHANCE = 'Behance';
	public const DRIBBBLE = 'Dribbble';
	public const VIMEO = 'Vimeo';
	public const WAZE = 'Waze';
	public const MESSENGER = 'Messenger';
	public const TELEPHONE = 'Telephone';
	public const EMAIL = 'Email';
	public const URL = 'Url';
	public const FILE_DOWNLOAD = 'File Download';

	public static function get_social_networks_icons(): array {
		static::init_social_networks_array_if_empty();

		static $icons = [];

		if ( empty( $icons ) ) {
			foreach ( static::$social_networks as $network => $data ) {
				$icons[ $network ] = $data['icon'];
			}
		}

		return $icons;
	}

	public static function get_icon_mapping( string $platform ): string {
		static::init_social_networks_array_if_empty();

		if ( isset( self::$social_networks[ $platform ]['icon'] ) ) {
			return self::$social_networks[ $platform ]['icon'];
		}
		return '';

	}

	public static function get_social_networks_text( $providers = [] ): array {
		static::init_social_networks_array_if_empty();

		static $texts = [];

		if ( empty( $texts ) ) {
			foreach ( static::$social_networks as $network => $data ) {
				$texts[ $network ] = $data['text'];
			}
		}

		if ( $providers ) {
			return array_intersect_key( $texts, array_flip( $providers ) );
		}

		return $texts;
	}

	private static function init_social_networks_array_if_empty(): void {
		if ( ! empty( static::$social_networks ) ) {
			return;
		}

		static::$social_networks[ static::FACEBOOK ] = [
			'text' => esc_html__( 'Facebook', 'elementor' ),
			'icon' => 'fab fa-facebook',
		];

		static::$social_networks[ static::TWITTER ] = [
			'text' => esc_html__( 'X (Twitter)', 'elementor' ),
			'icon' => 'fab fa-x-twitter',
		];

		static::$social_networks[ static::INSTAGRAM ] = [
			'text' => esc_html__( 'Instagram', 'elementor' ),
			'icon' => 'fab fa-instagram',
		];

		static::$social_networks[ static::LINKEDIN ] = [
			'text' => esc_html__( 'LinkedIn', 'elementor' ),
			'icon' => 'fab fa-linkedin-in',
		];

		static::$social_networks[ static::PINTEREST ] = [
			'text' => esc_html__( 'Pinterest', 'elementor' ),
			'icon' => 'fab fa-pinterest',
		];

		static::$social_networks[ static::YOUTUBE ] = [
			'text' => esc_html__( 'YouTube', 'elementor' ),
			'icon' => 'fab fa-youtube',
		];

		static::$social_networks[ static::TIKTOK ] = [
			'text' => esc_html__( 'TikTok', 'elementor' ),
			'icon' => 'fab fa-tiktok',
		];

		static::$social_networks[ static::WHATSAPP ] = [
			'text' => esc_html__( 'WhatsApp', 'elementor' ),
			'icon' => 'fab fa-whatsapp',
		];

		static::$social_networks[ static::APPLEMUSIC ] = [
			'text' => esc_html__( 'Apple Music', 'elementor' ),
			'icon' => 'fab fa-apple-music',
		];

		static::$social_networks[ static::SPOTIFY ] = [
			'text' => esc_html__( 'Spotify', 'elementor' ),
			'icon' => 'fab fa-spotify',
		];

		static::$social_networks[ static::SOUNDCLOUD ] = [
			'text' => esc_html__( 'SoundCloud', 'elementor' ),
			'icon' => 'fab fa-soundcloud',
		];

		static::$social_networks[ static::BEHANCE ] = [
			'text' => esc_html__( 'Behance', 'elementor' ),
			'icon' => 'fab fa-behance',
		];

		static::$social_networks[ static::DRIBBBLE ] = [
			'text' => esc_html__( 'Dribbble', 'elementor' ),
			'icon' => 'fab fa-dribbble',
		];

		static::$social_networks[ static::VIMEO ] = [
			'text' => esc_html__( 'Vimeo', 'elementor' ),
			'icon' => 'fab fa-vimeo-v',
		];

		static::$social_networks[ static::WAZE ] = [
			'text' => esc_html__( 'Waze', 'elementor' ),
			'icon' => 'fab fa-waze',
		];

		static::$social_networks[ static::MESSENGER ] = [
			'text' => esc_html__( 'Messenger', 'elementor' ),
			'icon' => 'fab fa-facebook-messenger',
		];

		static::$social_networks[ static::TELEPHONE ] = [
			'text' => esc_html__( 'Telephone', 'elementor' ),
			'icon' => 'fas fa-phone-alt',
		];

		static::$social_networks[ static::EMAIL ] = [
			'text' => esc_html__( 'Email', 'elementor' ),
			'icon' => 'fas fa-envelope',
		];

		static::$social_networks[ static::URL ] = [
			'text' => esc_html__( 'URL', 'elementor' ),
			'icon' => 'fas fa-link',
		];

		static::$social_networks[ static::FILE_DOWNLOAD ] = [
			'text' => esc_html__( 'File Download', 'elementor' ),
			'icon' => 'fas fa-download',
		];
	}
}
