<?php

namespace Elementor\Modules\Interactions;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Adapter {
    const VERSION_V1 = 1;
    const VERSION_V2 = 2;
    const ITEMS_TYPE = 'interactions-array';

    /**
     * Wrap interactions data from v1 to v2 format before saving to DB.
     * {items: [], version: 1} → {items: {$$type: 'interactions-array', value: []}, version: 2}
     */
    public static function wrap_for_db( $interactions ) {
        $decoded = self::decode( $interactions );

        if ( empty( $decoded ) || ! isset( $decoded['items'] ) ) {
            return $interactions;
        }

        // Already in v2 format
        if ( isset( $decoded['version'] ) && $decoded['version'] === self::VERSION_V2 ) {
            return $interactions;
        }

        // Already wrapped (items has $$type)
        if ( isset( $decoded['items']['$$type'] ) ) {
            return $interactions;
        }

        $items = is_array( $decoded['items'] ) ? $decoded['items'] : [];

        $wrapped = [
            'items' => [
                '$$type' => self::ITEMS_TYPE,
                'value' => $items,
            ],
            'version' => self::VERSION_V2,
        ];

        return wp_json_encode( $wrapped );
    }

    /**
     * Unwrap interactions data from v2 to v1 format before sending to FE.
     * {items: {$$type: 'interactions-array', value: []}, version: 2} → {items: [], version: 1}
     */
    public static function unwrap_for_frontend( $interactions ) {
        $decoded = self::decode( $interactions );

        if ( empty( $decoded ) || ! isset( $decoded['items'] ) ) {
            return $interactions;
        }

        // Already in v1 format (items is array, not object with $$type)
        if ( is_array( $decoded['items'] ) && ! isset( $decoded['items']['$$type'] ) ) {
            return $interactions;
        }

        // Check if it's wrapped v2 format
        if ( isset( $decoded['items']['$$type'] ) && $decoded['items']['$$type'] === self::ITEMS_TYPE ) {
            $items = isset( $decoded['items']['value'] ) ? $decoded['items']['value'] : [];

            $unwrapped = [
                'items' => $items,
                'version' => self::VERSION_V1,
            ];

            return wp_json_encode( $unwrapped );
        }

        return $interactions;
    }

    /**
     * Decode interactions from string or return as-is if array.
     */
    private static function decode( $interactions ) {
        if ( is_array( $interactions ) ) {
            return $interactions;
        }

        if ( is_string( $interactions ) ) {
            $decoded = json_decode( $interactions, true );
            if ( json_last_error() === JSON_ERROR_NONE && is_array( $decoded ) ) {
                return $decoded;
            }
        }

        return [];
    }
}