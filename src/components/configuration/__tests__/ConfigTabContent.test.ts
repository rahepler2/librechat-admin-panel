import { describe, it, expect } from 'vitest';
import { collectSectionOverrides } from '../ConfigTabContent';

describe('collectSectionOverrides', () => {
  it('returns nothing when no override paths exist', () => {
    expect(collectSectionOverrides('interface', 'interface', undefined)).toEqual({
      count: 0,
      resetPaths: [],
    });
    expect(collectSectionOverrides('interface', 'interface', new Set())).toEqual({
      count: 0,
      resetPaths: [],
    });
  });

  it('dedupes leaf overrides to the top-level key below the section', () => {
    const paths = new Set([
      'mcpServers.kapa.title',
      'mcpServers.kapa.url',
      'mcpServers.other.command',
      'interface.modelSelect',
    ]);
    const result = collectSectionOverrides('mcpServers', 'mcpServers', paths);
    expect(result.count).toBe(3);
    expect(new Set(result.resetPaths)).toEqual(
      new Set(['mcpServers.kapa', 'mcpServers.other']),
    );
  });

  it('includes a section-root override for scalar sections', () => {
    const result = collectSectionOverrides('cache', 'cache', new Set(['cache']));
    expect(result).toEqual({ count: 1, resetPaths: ['cache'] });
  });

  it('keeps the custom-endpoints and providers sweeps disjoint', () => {
    const paths = new Set([
      'endpoints.custom.0.name',
      'endpoints.openAI.titleModel',
      'endpoints.azureOpenAI.groups',
    ]);
    const custom = collectSectionOverrides('endpoints', 'endpoints', paths);
    expect(custom.count).toBe(1);
    expect(custom.resetPaths).toEqual(['endpoints.custom']);

    const providers = collectSectionOverrides('endpointsProviders', 'endpoints', paths);
    expect(providers.count).toBe(2);
    expect(new Set(providers.resetPaths)).toEqual(
      new Set(['endpoints.openAI', 'endpoints.azureOpenAI']),
    );
  });

  it('ignores paths outside the section', () => {
    const paths = new Set(['interfaceX.something', 'interface.modelSelect']);
    const result = collectSectionOverrides('interface', 'interface', paths);
    expect(result).toEqual({ count: 1, resetPaths: ['interface.modelSelect'] });
  });
});
