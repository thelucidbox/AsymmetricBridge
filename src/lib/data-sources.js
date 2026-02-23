import { fetchAllFredData } from "./fred.js";
import { fetchBatchQuotes } from "./stocks.js";
import { fetchStablecoinData } from "./crypto.js";

const registry = new Map();

function isFunction(value) {
  return typeof value === "function";
}

function validateAdapterShape(name, adapter) {
  if (!adapter || typeof adapter !== "object") {
    throw new Error(`DataSourceRegistry.register("${name}") expects an object`);
  }
  if (!isFunction(adapter.fetch)) {
    throw new Error(
      `Data source "${name}" must include a fetch() function`,
    );
  }
  if (!isFunction(adapter.validate)) {
    throw new Error(
      `Data source "${name}" must include a validate() function`,
    );
  }
  if (!isFunction(adapter.transform)) {
    throw new Error(
      `Data source "${name}" must include a transform() function`,
    );
  }
}

function register(name, adapter) {
  if (typeof name !== "string" || name.trim().length === 0) {
    throw new Error("DataSourceRegistry.register() requires a non-empty name");
  }

  const key = name.trim();
  validateAdapterShape(key, adapter);
  registry.set(key, adapter);
  return adapter;
}

function get(name) {
  return registry.get(name);
}

function list() {
  return Array.from(registry.keys());
}

export const DataSourceRegistry = {
  register,
  get,
  list,
};

DataSourceRegistry.register("fred", {
  fetch: fetchAllFredData,
  validate: (data) => data !== null && typeof data === "object",
  transform: (data) => data,
});

DataSourceRegistry.register("twelve_data", {
  fetch: fetchBatchQuotes,
  validate: (data) => data !== null && typeof data === "object",
  transform: (data) => data,
});

DataSourceRegistry.register("coingecko", {
  fetch: fetchStablecoinData,
  validate: (data) =>
    data !== null && typeof data === "object" && Array.isArray(data.coins),
  transform: (data) => data,
});
