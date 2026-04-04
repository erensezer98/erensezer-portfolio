/**
 * Google Drive image utilities
 *
 * HOW TO GET A FILE ID
 * --------------------
 * 1. Upload the image to Google Drive.
 * 2. Right-click → "Get link" → set access to "Anyone with the link".
 * 3. The share URL looks like:
 *      https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 *    Copy the FILE_ID portion between /d/ and /view.
 *
 * HOW TO USE IN THE ADMIN PANEL
 * ------------------------------
 * Paste the full URL returned by `gdriveUrl(fileId)` into the
 * "Cover Image URL" or "Project Gallery Images" fields.
 *
 * WHICH URL FORMAT TO USE
 * -----------------------
 * - `gdriveUrl`          → direct download link via /uc endpoint.
 *                          Works well with next/image. Use this by default.
 * - `gdriveThumbnailUrl` → thumbnail CDN (lh3.googleusercontent.com).
 *                          Faster for small previews; size is capped by `size`.
 *
 * NOTE: Google Drive imposes rate limits on high-traffic direct downloads.
 * For a production site with many visitors, consider copying images to a
 * dedicated storage service (Cloudflare R2, Supabase Storage, etc.) and
 * using those URLs instead.
 */

/**
 * Returns a publicly-accessible image URL for a Google Drive file.
 *
 * @param fileId  The Google Drive file ID (the long string between /d/ and /view in the share URL).
 * @returns       A URL that next/image can fetch directly.
 *
 * @example
 *   gdriveUrl('1A2B3C4D5E6F7G8H9I0J')
 *   // → 'https://drive.google.com/uc?export=view&id=1A2B3C4D5E6F7G8H9I0J'
 */
export function gdriveUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=view&id=${fileId}`
}

/**
 * Returns a Google Drive thumbnail URL served from Google's CDN.
 * Good for previews; not guaranteed to return the full-resolution image.
 *
 * @param fileId  The Google Drive file ID.
 * @param size    Max dimension in pixels (default 1600). Google snaps to the
 *                nearest supported size (e.g. 400, 800, 1024, 1600).
 * @returns       A thumbnail URL.
 *
 * @example
 *   gdriveThumbnailUrl('1A2B3C4D5E6F7G8H9I0J', 1200)
 *   // → 'https://lh3.googleusercontent.com/d/1A2B3C4D5E6F7G8H9I0J=w1200'
 */
export function gdriveThumbnailUrl(fileId: string, size = 1600): string {
  return `https://lh3.googleusercontent.com/d/${fileId}=w${size}`
}
