import 'dotenv/config';
import { Agent, run, tool } from '@openai/agents';
import { z } from 'zod';

const fetchAvailablePlans = tool({
  name: 'fetch_available_plans',
  description: 'Fetch the available plans from the database.',
  parameters: z.object({}),
  execute: async () => [
    { plan_id: 1, plan_name: 'Plan 1', plan_price: 1000 },
    { plan_id: 2, plan_name: 'Plan 2', plan_price: 2000 },
    { plan_id: 3, plan_name: 'Plan 3', plan_price: 3000 },
    { plan_id: 4, plan_name: 'Plan 4', plan_price: 4000 },
    { plan_id: 5, plan_name: 'Plan 5', plan_price: 5000 },
    { plan_id: 6, plan_name: 'Plan 6', plan_price: 6000 },
    { plan_id: 7, plan_name: 'Plan 7', plan_price: 7000 },
    { plan_id: 8, plan_name: 'Plan 8', plan_price: 8000 },
    { plan_id: 9, plan_name: 'Plan 9', plan_price: 9000 },
    { plan_id: 10, plan_name: 'Plan 10', plan_price: 10000 },
  ],
});

const refundPlan = tool({
  name: 'refund_plan',
  description: 'Refund the plan for the customer.',
  parameters: z.object({
    plan_id: z.number(),
  }),
  execute: async ({ plan_id: _planId }) => 'Plan refunded successfully',
});

const refundAgent = new Agent({
  name: 'Refund Agent',
  instructions: 'You are a helpful refund agent that can help customers with their refund inquiries.',
  tools: [refundPlan],
});

const salesAgent = new Agent({
  name: 'Sales Agent',
  instructions: 'You are a helpful sales agent that can help customers with their sales inquiries.',
  tools: [fetchAvailablePlans],
});

async function runAgent(query = '') {
  const result = await run(salesAgent, query);
  console.log(result.finalOutput);
}

void runAgent('hey there !!! What are the available plans?');

export { refundAgent, salesAgent };
