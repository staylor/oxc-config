const LIST_KEYS = new Set(['extends', 'plugins', 'jsPlugins', 'ignorePatterns', 'overrides']);

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const identity = (entry) => (typeof entry === 'string' ? entry : (entry?.name ?? entry?.specifier));

function mergeList(key, base = [], next = []) {
  const merged = [...base];

  for (const entry of next) {
    const duplicate =
      key !== 'overrides' && merged.some((existing) => identity(existing) === identity(entry));

    if (!duplicate) {
      merged.push(entry);
    }
  }

  return merged;
}

function mergeSettings(base = {}, next) {
  const merged = { ...base };

  for (const [plugin, settings] of Object.entries(next)) {
    merged[plugin] =
      isPlainObject(settings) && isPlainObject(merged[plugin])
        ? { ...merged[plugin], ...settings }
        : settings;
  }

  return merged;
}

export function merge(...configs) {
  const result = {};

  for (const config of configs) {
    for (const [key, value] of Object.entries(config)) {
      if (value === undefined) {
        continue;
      }

      if (LIST_KEYS.has(key)) {
        result[key] = mergeList(key, result[key], value);
      } else if (key === 'settings') {
        result.settings = mergeSettings(result.settings, value);
      } else if (isPlainObject(value) && isPlainObject(result[key])) {
        result[key] = { ...result[key], ...value };
      } else {
        result[key] = value;
      }
    }
  }

  return result;
}
