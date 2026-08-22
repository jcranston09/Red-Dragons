import mqtt from "mqtt";
import { emptyTeamDoc, normalizeTeamDoc } from "./teamSync.js";

const TOPIC = "reddragons/dyf-k/playbook/c7e9a21f4b6d";
const BROKERS = ["wss://broker.emqx.io:8084/mqtt"];
const CLIENT_KEY = "red-dragons-k-sync-client";

function clientId() {
  try {
    const existing = localStorage.getItem(CLIENT_KEY);
    if (existing) return existing;
    const next = `rdk-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(CLIENT_KEY, next);
    return next;
  } catch {
    return `rdk-${Math.random().toString(36).slice(2, 10)}`;
  }
}

let client = null;
let pending = null;
let brokerIndex = 0;
const docListeners = new Set();
const statusListeners = new Set();

function setStatus(status) {
  for (const fn of statusListeners) fn(status);
}

function emitDoc(doc) {
  const normalized = normalizeTeamDoc(doc);
  for (const fn of docListeners) fn(normalized);
}

function flush() {
  if (!client?.connected || !pending) return;
  const body = JSON.stringify(pending);
  client.publish(TOPIC, body, { qos: 1, retain: true }, (err) => {
    if (err) setStatus("offline");
  });
}

function attach(url) {
  const next = mqtt.connect(url, {
    clientId: clientId(),
    clean: true,
    connectTimeout: 8000,
    reconnectPeriod: 4000,
    keepalive: 30,
  });
  client = next;

  next.on("connect", () => {
    setStatus("live");
    next.subscribe(TOPIC, { qos: 1 });
    flush();
  });

  next.on("reconnect", () => setStatus("connecting"));
  next.on("offline", () => setStatus("offline"));
  next.on("close", () => {
    if (!next.connected) setStatus("offline");
  });
  next.on("error", () => setStatus("offline"));

  next.on("message", (_topic, payload) => {
    try {
      emitDoc(JSON.parse(payload.toString()));
    } catch {
      /* ignore bad payloads */
    }
  });
}

export function startTeamSync({ onDoc, onStatus }) {
  if (onDoc) docListeners.add(onDoc);
  if (onStatus) statusListeners.add(onStatus);
  setStatus(client?.connected ? "live" : "connecting");
  if (!client) attach(BROKERS[brokerIndex % BROKERS.length]);

  return () => {
    if (onDoc) docListeners.delete(onDoc);
    if (onStatus) statusListeners.delete(onStatus);
  };
}

export function publishTeamDoc(doc) {
  pending = normalizeTeamDoc({ ...emptyTeamDoc(), ...doc, updatedAt: new Date().toISOString() });
  if (client?.connected) flush();
  else setStatus(client ? "offline" : "connecting");
}

export function refreshTeamSync() {
  if (client?.connected) {
    client.unsubscribe(TOPIC, () => client.subscribe(TOPIC, { qos: 1 }));
    return;
  }
  try {
    client?.end(true);
  } catch {
    /* ignore */
  }
  client = null;
  brokerIndex += 1;
  attach(BROKERS[brokerIndex % BROKERS.length]);
}
