import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getAgentById, listAgents } from '../services/agentService.js';

export function agentsRouter(): Router {
  const r = Router();

  r.get(
    '/agents',
    asyncHandler(async (_req, res) => {
      res.json(listAgents());
    }),
  );

  r.get(
    '/agents/:id',
    asyncHandler(async (req, res) => {
      const agent = getAgentById(req.params.id);
      if (!agent) {
        res.status(404).json({ error: 'Unknown agent id', requestId: req.requestId });
        return;
      }
      res.json(agent);
    }),
  );

  return r;
}
