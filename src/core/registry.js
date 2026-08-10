// Service registry: single source of truth for which AWS-like services WAHH emulates.
// The UI and docs enumerate this instead of hardcoding service lists.

export class ServiceRegistry {
  constructor() {
    this._services = new Map();
  }

  register(definition) {
    if (!definition || typeof definition.id !== 'string' || !definition.id) {
      throw new TypeError('Service definition requires a non-empty string id.');
    }
    if (typeof definition.factory !== 'function') {
      throw new TypeError(`Service "${definition.id}" requires a factory function.`);
    }
    if (this._services.has(definition.id)) {
      throw new Error(`Service "${definition.id}" is already registered.`);
    }
    this._services.set(definition.id, {
      id: definition.id,
      name: definition.name || definition.id,
      description: definition.description || '',
      factory: definition.factory,
    });
  }

  get(id) {
    const def = this._services.get(id);
    if (!def) throw new Error(`Service "${id}" is not registered.`);
    return def;
  }

  list() {
    return [...this._services.values()].map(({ id, name, description }) => ({ id, name, description }));
  }

  create(id, ...args) {
    const def = this.get(id);
    return def.factory(...args);
  }
}
