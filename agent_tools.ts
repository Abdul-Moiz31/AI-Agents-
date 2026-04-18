import 'dotenv/config';
import { Agent, run, tool } from '@openai/agents';
import axios from 'axios';
import { z } from 'zod';

const getWeather = tool({
  name: 'get_weather',
  description: 'Return the weather for a given city.',
  parameters: z.object({ city: z.string() }),
  execute: async ({ city }) => {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      throw new Error(
        'OPENWEATHER_API_KEY is not set. Add it to .env (OpenWeatherMap API key, not the OpenAI key).',
      );
    }
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    const { data } = await axios.get(url);
    return data;
  },
});

const agent = new Agent({
  name: 'Weather Agent',
  instructions: 'You are a helpful weather agent that can get the weather for a given city.',
  tools: [getWeather],
});

async function main() {
  const result = await run(agent, 'What is the weather in Karachi?');
  console.log(result.finalOutput);
}

void main();
