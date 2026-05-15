import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('README behavior documentation', () => {
  const readme = readFileSync(join(process.cwd(), 'README.md'), 'utf8');

  it('documents refresh behavior and failure modes', () => {
    expect(readme).toContain('warehouse.refresh');
    expect(readme).toContain('previous value remains');
    expect(readme).toContain('Warehouse loader not found');
  });

  it('documents freeze replacement semantics and unsupported unlock behavior', () => {
    expect(readme).toContain('Frozen objects cannot be unfrozen');
    expect(readme).toContain('replace');
    expect(readme).toContain('unlock');
  });

  it('documents bootstrap-only beforeInit behavior', () => {
    expect(readme).toContain('bootstrap-only');
    expect(readme).toContain('refresh does not call');
  });

  it('documents out-of-scope cache and refresh behavior', () => {
    expect(readme).toContain('refreshAll()');
    expect(readme).toContain('TTL');
    expect(readme).toContain('invalidation');
    expect(readme).toContain('distributed cache');
    expect(readme).toContain('Deep freeze');
  });

  it('documents namespace behavior and first-version namespace limits', () => {
    expect(readme).toContain('root namespace');
    expect(readme).toContain("ns: 'chapter1'");
    expect(readme).toContain('Namespaced refresh is not supported');
    expect(readme).toContain('Namespaced symbol keys are not supported');
    expect(readme).toContain('`keys()` without `ns` returns only root keys');
    expect(readme).toContain('`clear({ ns })` removes only that namespace');
  });
});
