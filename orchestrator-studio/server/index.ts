import { createApp } from './app.js';
import { getConfig, loadEnvironment } from './config/env.js';

loadEnvironment();
const cfg = getConfig();
const app = createApp(cfg);

app.listen(cfg.port, () => {
  console.log(`Orchestrator API  http://127.0.0.1:${cfg.port}`);
  console.log(`Health http://127.0.0.1:${cfg.port}/api/health`);
  console.log(`Meta             http://127.0.0.1:${cfg.port}/api/meta`);
});
