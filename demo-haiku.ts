import 'dotenv/config';
import { Agent, run } from '@openai/agents';

const location = 'pakistan';

const agent = new Agent({
  name: 'Hello Agent',
  instructions: () => {
    if (location === 'pakistan') {
      return 'You are a helpful assistant that can write haikus about recursion in programming please reply with users name.';
    }
    return 'the location is not correct';
  },
});

const result = await run(agent, 'Write a haiku about recursion in programming.');
console.log(result.finalOutput);
