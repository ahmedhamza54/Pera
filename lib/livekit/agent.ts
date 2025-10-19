import {
    type JobContext,
    type JobProcess,
    WorkerOptions,
    cli,
    defineAgent,
    voice,
    getJobContext,
    llm
} from '@livekit/agents';
import * as livekit from '@livekit/agents-plugin-livekit';
import * as silero from '@livekit/agents-plugin-silero';
import { BackgroundVoiceCancellation } from '@livekit/noise-cancellation-node';
// Ensure TextEncoder is available in older Node versions / TS environments
import { TextEncoder as NodeTextEncoder } from 'util';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const myTool = llm.tool({
    description: `Use this tool to send the results of a diagnostic session to the user.
          The tool should only be called after the assistant has gathered the user's problem, objective, and motivation.
          `,
    parameters: {
        type: 'object',
        properties: {
            problem: {
                type: 'string',
                description: 'The main issue or challenge the user is facing.'
            },
            objectif: {
                type: 'string',
                description: 'The goal the user wants to achieve.'
            },
            motivation: {
                type: 'string',
                description: 'The reason or incentive driving the user to reach this goal.'
            }
        },
        required: ['problem', 'objectif', 'motivation']
    },
    execute: async ({ problem, objectif, motivation }, ctx) => {
        try {
            const room = getJobContext().room
            const response = JSON.stringify({ objectif, problem, motivation })
            await room.localParticipant!.publishData(
                new NodeTextEncoder().encode(response),
                { reliable: true }
            )
            return { status: 'sent' }
        } catch (error) {
            throw new llm.ToolError("Failed to push diagnostic results")
        }
    }
});


class Assistant extends voice.Agent {


constructor() {
        super({
            instructions: `You are a friendly voice assistant. 
            Your task is to help the user identify their problem, objective, and motivation. 
            Ask the user one by one: first their main problem, then their objective, then their motivation. 
            Don't tal too much.
            After collecting all three pieces of information, call the diagnostic tool to push the structured results. 
            Do not format text, speak only in plain voice-friendly sentences.
            Always respond in plain sentences suitable for voice.
            you read only letters and numbers.`,
            tools: { myTool }
        })
    }


}

export default defineAgent({
    prewarm: async (proc: JobProcess) => {
        proc.userData.vad = await silero.VAD.load();
    },
    entry: async (ctx: JobContext) => {
        const session = new voice.AgentSession({
            vad: ctx.proc.userData.vad! as silero.VAD,
            stt: 'deepgram/nova-3:en',
            llm: 'deepseek-ai/deepseek-v3',
            tts: 'cartesia/sonic-2:9626c31c-bec5-4cca-baa8-f8ba9e84c8bc',
            turnDetection: new livekit.turnDetector.MultilingualModel(),
        });

        await session.start({
            agent: new Assistant(),
            room: ctx.room,
            inputOptions: {
                noiseCancellation: BackgroundVoiceCancellation(),
            },
        });

        await ctx.connect();
      const p = [...ctx.room.remoteParticipants.values()][0];
p && session.generateReply({ instructions: `Greet ${p.identity} and offer your assistance.` });

    },
});

cli.runApp(new WorkerOptions({ agent: fileURLToPath(import.meta.url) }));