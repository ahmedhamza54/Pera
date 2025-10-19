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


    description: `Use this tool to push a diagnostic message to the user.
          The message should describe the potential issue the user is facing based on their input.
          Only use this tool when you detect a problem mentioned by the user.`,
    parameters: {
        type: 'object',
        properties: {
            problem_description: {
                type: 'string',
                description: 'A brief description of the problem the user is facing.'
            }
        },
        required: ['problem_description']
    },

    execute: async ({ problem_description }, ctx) => {

        try {
            const room = getJobContext().room;
            const participant = Array.from(room.remoteParticipants.values())[0]!;
            const response = await room.localParticipant!.publishData(
                new TextEncoder().encode(problem_description),
                { reliable: false }
            );




            return response;
        } catch (error) {
            throw new llm.ToolError("Unable to retrieve user location");
        }
    }
});


class Assistant extends voice.Agent {


    constructor() {
        super({
            instructions: `You are a helpful voice AI assistant. The user is interacting with you via voice.
      You detect problems the user mentions and push diagnostics to the data channel when needed.
      Responses should be concise and friendly.`,
            tools: {
                myTool
            }
        });
    }

    // This function mimics the Python 'diagnostic_tracker'

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