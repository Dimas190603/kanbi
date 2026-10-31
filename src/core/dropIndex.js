/**
 * Menghitung indeks target untuk penyisipan elemen (drag-and-drop)
 * berdasarkan posisi vertikal pointer dan titik tengah elemen-elemen yang ada.
 *
 * @param {number[]} midpoints - Array berisi koordinat titik tengah Y dari setiap elemen.
 * @param {number} pointerY - Posisi koordinat Y dari kursor atau sentuhan saat ini.
 * @returns {number} Indeks tempat elemen baru seharusnya disisipkan.
 *
 * @example
 * // Jika titik tengah elemen adalah [100, 200, 300] dan kursor berada di posisi 150:
 * const targetIndex = indexFromMidpoints([100, 200, 300], 150);
 * // Hasilnya: 1 (karena 150 < 200, elemen akan disisipkan sebelum elemen kedua)
 */
export function indexFromMidpoints(midpoints, pointerY) {
  const index = midpoints.findIndex((mid) => pointerY < mid);
  return index === -1 ? midpoints.length : index;
}

/**
 * Menghitung indeks target tempat sebuah kartu (card) harus dijatuhkan (drop)
 * di dalam sebuah kolom berdasarkan posisi kursor vertikal (pointerY).
 *
 * @param {HTMLElement} columnEl - Elemen DOM dari kolom tempat kartu berada.
 * @param {string|number} draggedCardId - ID unik dari kartu yang sedang diseret.
 * @param {number} pointerY - Posisi koordinat Y dari kursor atau sentuhan saat ini.
 * @returns {number} Indeks posisi target tempat kartu akan disisipkan.
 *
 * @example
 * const dropIndex = getDropIndex(columnElement, 'card-abc-123', 350);
 * console.log(dropIndex); // Output contoh: 2
 */

export function getDropIndex(columnEl, draggedCardId, pointerY) {
  const midpoints = [...columnEl.querySelectorAll('.card')]
    .filter((el) => el.dataset.cardId !== draggedCardId)
    .map((el) => {
      const rect = el.getBoundingClientRect();
      return (rect.top + rect.height) / 2;
    });

  return indexFromMidpoints(midpoints, pointerY);
}
