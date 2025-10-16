// A simple in-memory store for telemetry data.
// In a real production environment, you would use a proper OpenTelemetry collector
// and a persistent database.

interface TelemetryData {
  traces: any[];
  metrics: any[];
  logs: any[];
}

// Initialize with some default structure
const store: TelemetryData = {
  traces: [],
  metrics: [],
  logs: [],
};

export const telemetryStore = {
  addTrace: (trace: any) => {
    // Keep the store from growing indefinitely
    if (store.traces.length > 50) {
      store.traces.shift();
    }
    store.traces.push(trace);
  },
  addMetric: (metric: any) => {
    if (store.metrics.length > 50) {
      store.metrics.shift();
    }
    store.metrics.push(metric);
  },
  addLog: (log: any) => {
    if (store.logs.length > 50) {
      store.logs.shift();
    }
    store.logs.push(log);
  },
  getData: (): TelemetryData => {
    return JSON.parse(JSON.stringify(store)); // Return a copy
  },
  clear: () => {
    store.traces = [];
    store.metrics = [];
    store.logs = [];
  },
};
