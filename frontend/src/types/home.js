/**
 * Shared type definitions for Divishaa.couture.
 * Written as JSDoc typedefs so they work in a plain JS (non-TS) Vite project
 * but still give autocomplete + type-checking hints in most editors.
 * If the project migrates to TypeScript, these map 1:1 to interfaces.
 */

/**
 * @typedef {Object} Category
 * @property {string} id
 * @property {string} name
 * @property {string} image
 * @property {number} productCount
 * @property {string} slug
 */

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} brand
 * @property {string} name
 * @property {string} image
 * @property {number} price          - discounted / selling price
 * @property {number} [originalPrice] - MRP before discount (omit if no discount)
 * @property {number} rating          - 0 to 5
 * @property {number} [reviewCount]
 * @property {"new"|"bestseller"|"sale"|null} [badge]
 * @property {string[]} [sizes]
 * @property {string[]} [colors]
 * @property {boolean} [inStock]
 */

/**
 * @typedef {Object} CartLine
 * @property {string} id            - unique cart line id (product id + size/color combo)
 * @property {string} productId
 * @property {string} name
 * @property {string} image
 * @property {number} price
 * @property {number} quantity
 * @property {string} [size]
 * @property {string} [color]
 */

/**
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} customerName
 * @property {string} customerImage
 * @property {number} rating
 * @property {string} text
 * @property {string} purchasedProduct
 */

/**
 * @typedef {Object} Brand
 * @property {string} id
 * @property {string} name
 * @property {string} [logo]
 */

/**
 * @typedef {Object} PaginatedResponse
 * @property {Product[]} items
 * @property {number} page
 * @property {number} totalPages
 * @property {number} totalItems
 */

// Nothing is exported at runtime — this file only exists for JSDoc typedefs.
export {};
