import { createApp } from './app.js';
import { getConfig, loadEnvironment } from './config/env.js';

loadEnvironment();
const cfg = getConfig();
const app = createApp(cfg);

app.listen(cfg.port, () => {
  const host = `http://127.0.0.1:${cfg.port}`;
  console.log(`Orchestrator API  ${host}`);
  console.log(`Health ${host}/api/health`);
  console.log(`Meta             ${host}/api/meta`);
  if (cfg.studioDistDir) {
    console.log(`Studio UI        ${cfg.studioDistDir} (same origin)`);
  }
});
