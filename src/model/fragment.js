// src/model/fragment.js

// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    if (!ownerId) throw new Error('ownerId is required');
    if (!type) throw new Error('type is required');

    // Validating size
    if (typeof size !== 'number' || size < 0) {
      throw new Error('size must be a non-negative number');
    }

    // Validate content type
    if (!Fragment.isSupportedType(type)) {
      throw new Error('invalid type');
    }

    const now = new Date().toISOString();

    this.id = id || randomUUID();
    this.ownerId = ownerId;
    this.created = created || now;
    this.updated = updated || now;
    this.type = type;
    this.size = size;
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>|Array<string>>
   */
  static async byUser(ownerId, expand = false) {
    const result = await listFragments(ownerId, expand);

    if (!result) return [];

    // memory listFragments() returns JSON strings when expand=true
    if (expand) {
      return result.map((s) => new Fragment(JSON.parse(s)));
    }

    // expand=false already returns ids
    return result;
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    if (!ownerId) throw new Error('ownerId is required');
    if (!id) throw new Error('id is required');

    const meta = await readFragment(ownerId, id);

    // The tests expect missing fragments to be an error
    if (!meta) {
      throw new Error('fragment not found');
    }

    return new Fragment(meta);
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static delete(ownerId, id) {
    return deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment (metadata) to the database
   * @returns Promise<void>
   */
  async save() {
    this.updated = new Date().toISOString();
    await writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
async setData(data) {
  if (!Buffer.isBuffer(data)) {
    throw new Error('data must be a Buffer');
  }

  await writeFragmentData(this.ownerId, this.id, data);

  // Keep metadata in sync with data
  this.size = data.length;
  await this.save();
}

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    return this.mimeType.startsWith('text/');
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    // For Assignment 1 (early): only text/plain required
    // Later labs add conversions; for now just return its own type.
    return [this.mimeType];
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain; charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    try {
      const { type } = contentType.parse(value);
      return type === 'text/plain';
    } catch {
      return false;
    }
  }
}

module.exports.Fragment = Fragment;
