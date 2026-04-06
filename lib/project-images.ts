/**
 * Project image configuration — Google Drive
 *
 * This is the single source of truth for all project image file IDs.
 * Folder IDs are recorded for reference; what you actually need are the
 * FILE IDs of individual images inside those folders.
 *
 * ─── HOW TO FILL IN YOUR IMAGES ─────────────────────────────────────────────
 *
 * For each image you want to use:
 *   1. Open the relevant Drive subfolder (links below).
 *   2. Upload the image (JPG/PNG/WebP recommended).
 *   3. Right-click the file → "Get link" → set to "Anyone with the link".
 *   4. The share URL looks like:
 *        https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 *      Copy the FILE_ID (the long string between /d/ and /view).
 *   5. Replace the matching PLACEHOLDER_* string below with that FILE_ID.
 *
 * URL FORMAT
 *   Use lh3 (preferred — served from Google's CDN, works great with next/image):
 *     https://lh3.googleusercontent.com/d/FILE_ID
 *   Or the direct download endpoint as a fallback:
 *     https://drive.google.com/uc?export=view&id=FILE_ID
 *
 * SUBFOLDER GUIDE
 *   Cover   — Single hero/thumbnail image shown in project cards and at the top of the detail page.
 *   Gallery — Main project images shown in the detail page gallery.
 *   Process — Work-in-progress / process diagrams (optional, for use in page blocks).
 *   Wide    — Full-bleed or panoramic images (optional, for use in page blocks).
 *
 * ─── DRIVE ROOT ──────────────────────────────────────────────────────────────
 * Root folder: https://drive.google.com/drive/folders/19ZBWezlQrISQ-SK-hSGwfwChrpiKYYfV
 */

import { gdriveThumbnailUrl } from '@/lib/gdrive'

// ─── Folder reference (not used in URLs — for your navigation only) ───────────

export const DRIVE_FOLDERS = {
  root:                 '19ZBWezlQrISQ-SK-hSGwfwChrpiKYYfV',
  'food-tower': {
    folder:             '1uIJtCP2yJ3BZNjp1qmI-BRxDH58FQSun',
    cover:              '1ljdHLS_rgnSdmZjeQo-UE2ElKeqaP8ND',
    gallery:            '1vVqV0-Yq3yGZMcZm1yRQFEmmGyZ88mou',
    process:            '1oIVdyRNYc3deTUY1YHMyWOQTrawtQLc8',
    wide:               '1O6UkditGTQKUX1iiml-RvRSZAtGCOGwQ',
  },
  'istanbul-a-way-out': {
    folder:             '1s7xzeiCewoHXTh41-BgpPnrSZOh5g4g6',
    cover:              '1U4aOqHbrSbRLy5Usgm56RT1j-uMq6z7b',
    gallery:            '1ABcdVmJEyhgyf7JzcYKSbcm5xoxLIHAL',
    process:            '16LdT_HQED3_lPsYU2B9-4ly_0PuwLd8W',
    wide:               '1JPpt7kDHj4u1MGz5U-57eiR1vo_kL6ez',
  },
  'the-log': {
    folder:             '1WvFCPzA6gFpgEwa23bJ4l_h3HzM1ns27',
    cover:              '1gyy9k3PrJviqumemgYfI2jFyTsytQqsb',
    gallery:            '1Z22HbiZ9T2gvIimEFsZA4swUHSqvV2aq',
    process:            '1xhum1kFjBO-6RpOi_7WhxR3RxaVEMj18',
    wide:               '1O_yUdi89SLUk0NSsEShEU64MA1GwMsN1',
  },
  'halic-co-op': {
    folder:             '1T9cIiGjXxarFCUgTImvFH5F8ZaYwFS1y',
    cover:              '1LNibehFc2ES03OP8dBzPz3HNF5G5SP1h',
    gallery:            '1GDmxo4sBO8sxmo44KM8CYv_gMOUXgPzH',
    process:            '1rE_aJ-QePhE4AH4MDY2nF9SYd0EZ9fm1',
    wide:               '161jvhj43umRdkrc88_Ms49Am6s1uSiIr',
  },
  'csarda': {
    folder:             '1VgIxTWOf6c9xTFkslWi5lYxvaAdcK6Sn',
    cover:              '12yBl4l0DFEbBmpldmPnxsjIlSPQ3J3n9',
    gallery:            '1qFWHoUyXdqvzqIyBxcS1v-MjdmUfhBjY',
    process:            '1XYhYHFb52KNa7lwo0D_n9MqCYANtbxxQ',
    wide:               '1O7o0XxyM1R6EQggEes2c6_a8Wn2ApSQF',
  },
  'unfolding-landscapes': {
    folder:             'PLACEHOLDER_UNFOLDING_LANDSCAPES_FOLDER',
    cover:              'PLACEHOLDER_UNFOLDING_LANDSCAPES_COVER_FOLDER',
    gallery:            'PLACEHOLDER_UNFOLDING_LANDSCAPES_GALLERY_FOLDER',
    process:            'PLACEHOLDER_UNFOLDING_LANDSCAPES_PROCESS_FOLDER',
    wide:               'PLACEHOLDER_UNFOLDING_LANDSCAPES_WIDE_FOLDER',
  },
  'toor-toor-school': {
    folder:             'PLACEHOLDER_TOOR_TOOR_FOLDER',
    cover:              'PLACEHOLDER_TOOR_TOOR_COVER_FOLDER',
    gallery:            'PLACEHOLDER_TOOR_TOOR_GALLERY_FOLDER',
    process:            'PLACEHOLDER_TOOR_TOOR_PROCESS_FOLDER',
    wide:               'PLACEHOLDER_TOOR_TOOR_WIDE_FOLDER',
  },
  'mondadori': {
    folder:             'PLACEHOLDER_MONDADORI_FOLDER',
    cover:              'PLACEHOLDER_MONDADORI_COVER_FOLDER',
    gallery:            'PLACEHOLDER_MONDADORI_GALLERY_FOLDER',
    process:            'PLACEHOLDER_MONDADORI_PROCESS_FOLDER',
    wide:               'PLACEHOLDER_MONDADORI_WIDE_FOLDER',
  },
  'biennale': {
    folder:             'PLACEHOLDER_BIENNALE_FOLDER',
    cover:              'PLACEHOLDER_BIENNALE_COVER_FOLDER',
    gallery:            'PLACEHOLDER_BIENNALE_GALLERY_FOLDER',
    process:            'PLACEHOLDER_BIENNALE_PROCESS_FOLDER',
    wide:               'PLACEHOLDER_BIENNALE_WIDE_FOLDER',
  },
  'aquapraca': {
    folder:             'PLACEHOLDER_AQUAPRACA_FOLDER',
    cover:              'PLACEHOLDER_AQUAPRACA_COVER_FOLDER',
    gallery:            'PLACEHOLDER_AQUAPRACA_GALLERY_FOLDER',
    process:            'PLACEHOLDER_AQUAPRACA_PROCESS_FOLDER',
    wide:               'PLACEHOLDER_AQUAPRACA_WIDE_FOLDER',
  },
} as const

// ─── Image file IDs ───────────────────────────────────────────────────────────
// Replace each PLACEHOLDER_* value with the real Google Drive FILE ID of the
// image you uploaded to the matching subfolder. Folder IDs above are for
// navigation only — they cannot be used as image URLs.

export const PROJECT_IMAGE_IDS = {
  'food-tower': {
    // Cover/ subfolder → https://drive.google.com/drive/folders/1ljdHLS_rgnSdmZjeQo-UE2ElKeqaP8ND
    cover:   'PLACEHOLDER_FOOD_TOWER_COVER',
    // Gallery/ subfolder → https://drive.google.com/drive/folders/1vVqV0-Yq3yGZMcZm1yRQFEmmGyZ88mou
    gallery: [
      'PLACEHOLDER_FOOD_TOWER_GALLERY_1',
      'PLACEHOLDER_FOOD_TOWER_GALLERY_2',
    ],
    // Wide/ subfolder → https://drive.google.com/drive/folders/1O6UkditGTQKUX1iiml-RvRSZAtGCOGwQ
    wide: [
      'PLACEHOLDER_FOOD_TOWER_WIDE_1',
    ],
    // Process/ subfolder → https://drive.google.com/drive/folders/1oIVdyRNYc3deTUY1YHMyWOQTrawtQLc8
    process: [
      'PLACEHOLDER_FOOD_TOWER_PROCESS_1',
    ],
  },

  'istanbul-a-way-out': {
    // Cover/ subfolder → https://drive.google.com/drive/folders/1U4aOqHbrSbRLy5Usgm56RT1j-uMq6z7b
    cover:   'PLACEHOLDER_ISTANBUL_COVER',
    // Gallery/ subfolder → https://drive.google.com/drive/folders/1ABcdVmJEyhgyf7JzcYKSbcm5xoxLIHAL
    gallery: [
      'PLACEHOLDER_ISTANBUL_GALLERY_1',
      'PLACEHOLDER_ISTANBUL_GALLERY_2',
    ],
    // Wide/ subfolder → https://drive.google.com/drive/folders/1JPpt7kDHj4u1MGz5U-57eiR1vo_kL6ez
    wide: [
      'PLACEHOLDER_ISTANBUL_WIDE_1',
    ],
    // Process/ subfolder → https://drive.google.com/drive/folders/16LdT_HQED3_lPsYU2B9-4ly_0PuwLd8W
    process: [
      'PLACEHOLDER_ISTANBUL_PROCESS_1',
    ],
  },

  'the-log': {
    // Cover/ subfolder → https://drive.google.com/drive/folders/1gyy9k3PrJviqumemgYfI2jFyTsytQqsb
    cover:   'PLACEHOLDER_THE_LOG_COVER',
    // Gallery/ subfolder → https://drive.google.com/drive/folders/1Z22HbiZ9T2gvIimEFsZA4swUHSqvV2aq
    gallery: [
      'PLACEHOLDER_THE_LOG_GALLERY_1',
      'PLACEHOLDER_THE_LOG_GALLERY_2',
    ],
    // Wide/ subfolder → https://drive.google.com/drive/folders/1O_yUdi89SLUk0NSsEShEU64MA1GwMsN1
    wide: [
      'PLACEHOLDER_THE_LOG_WIDE_1',
    ],
    // Process/ subfolder → https://drive.google.com/drive/folders/1xhum1kFjBO-6RpOi_7WhxR3RxaVEMj18
    process: [
      'PLACEHOLDER_THE_LOG_PROCESS_1',
    ],
  },

  'halic-co-op': {
    // Cover/ subfolder → https://drive.google.com/drive/folders/1LNibehFc2ES03OP8dBzPz3HNF5G5SP1h
    cover:   'PLACEHOLDER_HALIC_COVER',
    // Gallery/ subfolder → https://drive.google.com/drive/folders/1GDmxo4sBO8sxmo44KM8CYv_gMOUXgPzH
    gallery: [
      'PLACEHOLDER_HALIC_GALLERY_1',
      'PLACEHOLDER_HALIC_GALLERY_2',
    ],
    // Wide/ subfolder → https://drive.google.com/drive/folders/161jvhj43umRdkrc88_Ms49Am6s1uSiIr
    wide: [
      'PLACEHOLDER_HALIC_WIDE_1',
    ],
    // Process/ subfolder → https://drive.google.com/drive/folders/1rE_aJ-QePhE4AH4MDY2nF9SYd0EZ9fm1
    process: [
      'PLACEHOLDER_HALIC_PROCESS_1',
    ],
  },

  'csarda': {
    // Cover/ subfolder → https://drive.google.com/drive/folders/12yBl4l0DFEbBmpldmPnxsjIlSPQ3J3n9
    cover:   'PLACEHOLDER_CSARDA_COVER',
    // Gallery/ subfolder → https://drive.google.com/drive/folders/1qFWHoUyXdqvzqIyBxcS1v-MjdmUfhBjY
    gallery: [
      'PLACEHOLDER_CSARDA_GALLERY_1',
      'PLACEHOLDER_CSARDA_GALLERY_2',
    ],
    // Wide/ subfolder → https://drive.google.com/drive/folders/1O7o0XxyM1R6EQggEes2c6_a8Wn2ApSQF
    wide: [
      'PLACEHOLDER_CSARDA_WIDE_1',
    ],
    // Process/ subfolder → https://drive.google.com/drive/folders/1XYhYHFb52KNa7lwo0D_n9MqCYANtbxxQ
    process: [
      'PLACEHOLDER_CSARDA_PROCESS_1',
    ],
  },

  'unfolding-landscapes': {
    // Cover/ subfolder → (create folder in Drive and replace PLACEHOLDER with the folder ID)
    cover:   'PLACEHOLDER_UNFOLDING_COVER',
    // Gallery/ subfolder
    gallery: [
      'PLACEHOLDER_UNFOLDING_GALLERY_1',
      'PLACEHOLDER_UNFOLDING_GALLERY_2',
      'PLACEHOLDER_UNFOLDING_GALLERY_3',
    ],
    // Wide/ subfolder
    wide: [
      'PLACEHOLDER_UNFOLDING_WIDE_1',
    ],
    // Process/ subfolder
    process: [
      'PLACEHOLDER_UNFOLDING_PROCESS_1',
      'PLACEHOLDER_UNFOLDING_PROCESS_2',
    ],
  },

  'toor-toor-school': {
    // Cover/ subfolder → (create folder in Drive and replace PLACEHOLDER with the folder ID)
    cover:   'PLACEHOLDER_TOOR_TOOR_COVER',
    // Gallery/ subfolder
    gallery: [
      'PLACEHOLDER_TOOR_TOOR_GALLERY_1',
      'PLACEHOLDER_TOOR_TOOR_GALLERY_2',
      'PLACEHOLDER_TOOR_TOOR_GALLERY_3',
    ],
    // Wide/ subfolder
    wide: [
      'PLACEHOLDER_TOOR_TOOR_WIDE_1',
    ],
    // Process/ subfolder
    process: [
      'PLACEHOLDER_TOOR_TOOR_PROCESS_1',
      'PLACEHOLDER_TOOR_TOOR_PROCESS_2',
    ],
  },

  'mondadori': {
    cover:   'PLACEHOLDER_MONDADORI_COVER',
    gallery: [
      'PLACEHOLDER_MONDADORI_GALLERY_1',
      'PLACEHOLDER_MONDADORI_GALLERY_2',
      'PLACEHOLDER_MONDADORI_GALLERY_3',
    ],
    wide: [
      'PLACEHOLDER_MONDADORI_WIDE_1',
    ],
    process: [
      'PLACEHOLDER_MONDADORI_PROCESS_1',
      'PLACEHOLDER_MONDADORI_PROCESS_2',
    ],
  },

  'biennale': {
    cover:   'PLACEHOLDER_BIENNALE_COVER',
    gallery: [
      'PLACEHOLDER_BIENNALE_GALLERY_1',
      'PLACEHOLDER_BIENNALE_GALLERY_2',
      'PLACEHOLDER_BIENNALE_GALLERY_3',
    ],
    wide: [
      'PLACEHOLDER_BIENNALE_WIDE_1',
    ],
    process: [
      'PLACEHOLDER_BIENNALE_PROCESS_1',
      'PLACEHOLDER_BIENNALE_PROCESS_2',
    ],
  },

  'aquapraca': {
    cover:   'PLACEHOLDER_AQUAPRACA_COVER',
    gallery: [
      'PLACEHOLDER_AQUAPRACA_GALLERY_1',
      'PLACEHOLDER_AQUAPRACA_GALLERY_2',
      'PLACEHOLDER_AQUAPRACA_GALLERY_3',
    ],
    wide: [
      'PLACEHOLDER_AQUAPRACA_WIDE_1',
    ],
    process: [
      'PLACEHOLDER_AQUAPRACA_PROCESS_1',
      'PLACEHOLDER_AQUAPRACA_PROCESS_2',
    ],
  },
}

// ─── Convenience accessors ────────────────────────────────────────────────────
// Use these to get ready-to-use image URLs for a project.

type ProjectSlug = keyof typeof PROJECT_IMAGE_IDS

/** Returns the lh3 CDN URL for a project's cover image. */
export function projectCoverUrl(slug: ProjectSlug): string {
  return gdriveThumbnailUrl(PROJECT_IMAGE_IDS[slug].cover)
}

/** Returns lh3 CDN URLs for all gallery images of a project. */
export function projectGalleryUrls(slug: ProjectSlug): string[] {
  return PROJECT_IMAGE_IDS[slug].gallery.map(id => gdriveThumbnailUrl(id))
}

/** Returns lh3 CDN URLs for all wide images of a project. */
export function projectWideUrls(slug: ProjectSlug): string[] {
  return PROJECT_IMAGE_IDS[slug].wide.map(id => gdriveThumbnailUrl(id))
}

/** Returns lh3 CDN URLs for all process images of a project. */
export function projectProcessUrls(slug: ProjectSlug): string[] {
  return PROJECT_IMAGE_IDS[slug].process.map(id => gdriveThumbnailUrl(id))
}
