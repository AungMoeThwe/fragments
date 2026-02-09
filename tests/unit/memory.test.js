const memory = require('../../src/model/data/memory');

describe('memory data strategy', () => {
  test('writeFragment() then readFragment() returns stored metadata object', async () => {
    const fragment = {
      ownerId: 'ownerA',
      id: 'frag1',
      created: '2026-01-01T00:00:00.000Z',
      updated: '2026-01-01T00:00:00.000Z',
      type: 'text/plain',
      size: 3,
    };

    await memory.writeFragment(fragment);
    const result = await memory.readFragment('ownerA', 'frag1');

    expect(result).toEqual(fragment);
  });

  test('readFragment() missing returns undefined (or null depending on MemoryDB)', async () => {
    const result = await memory.readFragment('ownerA', 'missing');
    expect(result == null).toBe(true); // passes for undefined OR null
  });

  test('writeFragmentData() then readFragmentData() returns stored Buffer', async () => {
    const data = Buffer.from('hello');

    await memory.writeFragmentData('ownerB', 'frag2', data);
    const result = await memory.readFragmentData('ownerB', 'frag2');

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.toString()).toBe('hello');
  });

  test('listFragments(ownerId) returns ONLY ids by default', async () => {
    await memory.writeFragment({ ownerId: 'ownerC', id: 'a', type: 'text/plain', size: 1 });
    await memory.writeFragment({ ownerId: 'ownerC', id: 'b', type: 'text/plain', size: 2 });
    await memory.writeFragment({ ownerId: 'ownerD', id: 'x', type: 'text/plain', size: 9 });

    const ids = await memory.listFragments('ownerC'); // expand defaults to false
    expect(ids.sort()).toEqual(['a', 'b']);
  });

  test('listFragments(ownerId, true) returns “expanded” fragments (raw JSON strings)', async () => {
    await memory.writeFragment({ ownerId: 'ownerE', id: 'z1', type: 'text/plain', size: 1 });
    await memory.writeFragment({ ownerId: 'ownerE', id: 'z2', type: 'text/plain', size: 2 });

    const expanded = await memory.listFragments('ownerE', true);

    expect(Array.isArray(expanded)).toBe(true);
    // In your prof code, expand=true returns the raw serialized strings from metadata DB
    const parsed = expanded.map((s) => JSON.parse(s));
    expect(parsed.map((f) => f.id).sort()).toEqual(['z1', 'z2']);
  });

  test('deleteFragment() removes metadata and data', async () => {
    await memory.writeFragment({ ownerId: 'ownerF', id: 'del1', type: 'text/plain', size: 4 });
    await memory.writeFragmentData('ownerF', 'del1', Buffer.from('data'));

    await memory.deleteFragment('ownerF', 'del1');

    const meta = await memory.readFragment('ownerF', 'del1');
    const data = await memory.readFragmentData('ownerF', 'del1');

    expect(meta == null).toBe(true);
    expect(data == null).toBe(true);
  });
});
