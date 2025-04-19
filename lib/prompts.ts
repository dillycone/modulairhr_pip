// Centralized prompt engineering helpers for AI endpoints
// ===============================================
import { env } from '@/lib/env';

/**
 * Represents a speaker with a name and role.
 */
export type Speaker = { name: string; role: string };

/**
 * Options for summary generation
 */
export interface SummarizeOptions {
  maxTokens?: number;
  temperature?: number;
  includeHeadings?: boolean;
}

/**
 * Available summary prompt versions for A/B testing
 */
export enum SummarizeVersion {
  A = 'v1',
  B = 'v2'
}

/**
 * Builds a prompt string for summarizing a transcript.
 * @param transcript Full transcript text to summarize.
 * @param version The prompt version to use (for A/B testing)
 * @param options Optional configuration parameters
 * @returns A formatted prompt instructing the model to summarize the transcript.
 */
export function buildSummarizationPrompt(
  transcript: string, 
  version: SummarizeVersion = determinePromptVersion(),
  options: SummarizeOptions = {}
): string {
  switch (version) {
    case SummarizeVersion.B:
      return buildV2SummarizationPrompt(transcript, options);
    case SummarizeVersion.A:
    default:
      return buildV1SummarizationPrompt(transcript, options);
  }
}

/**
 * Version 1 of the summarization prompt (original)
 */
function buildV1SummarizationPrompt(transcript: string, options: SummarizeOptions): string {
  return `Please summarize the following transcript of a meeting or conversation:

${transcript}

Create a concise, well-structured summary that includes:
1. Main topic and purpose of the conversation
2. Key points discussed
3. Action items or decisions made
4. Important deadlines or dates mentioned

Format the summary with sections and bullet points for readability.`;
}

/**
 * Version 2 of the summarization prompt (improved with more specific instructions)
 */
function buildV2SummarizationPrompt(transcript: string, options: SummarizeOptions): string {
  const headings = options.includeHeadings !== false;
  
  return `Analyze and summarize the following conversation transcript:

${transcript}

Create a professional executive summary that captures:
${headings ? '## Meeting Overview' : 'Meeting Overview:'}
- Identify the primary purpose and key topic of this conversation
- List the main participants and their roles (if discernible)

${headings ? '## Key Discussion Points' : 'Key Discussion Points:'}
- Highlight 3-5 critical topics or themes discussed
- For each point, provide important context and outcomes

${headings ? '## Action Items & Decisions' : 'Action Items & Decisions:'}
- Clearly list all action items with assigned owners (if mentioned)
- Summarize decisions or conclusions reached
- Note any specific deadlines, dates, or timeline commitments

Format as a professional document with ${headings ? 'markdown headings' : 'clear section titles'} and concise bullet points.
Keep the summary focused and actionable for busy professionals.`;
}

/**
 * Available transcription prompt versions for A/B testing
 */
export enum TranscriptionVersion {
  A = 'v1',
  B = 'v2'
}

/**
 * Options for transcription generation
 */
export interface TranscriptionOptions {
  includeTimestamps?: boolean;
  formatStyle?: 'simple' | 'detailed';
}

/**
 * Builds a default transcription prompt with speaker diarization instructions.
 * @param speakers List of speakers with their names and roles.
 * @param version The prompt version to use (for A/B testing)
 * @param options Optional configuration parameters
 * @returns A formatted prompt instructing the model to transcribe audio with speaker labels and timestamps.
 */
export function buildTranscriptionPrompt(
  speakers: Speaker[],
  version: TranscriptionVersion = determineTranscriptionVersion(),
  options: TranscriptionOptions = {}
): string {
  switch (version) {
    case TranscriptionVersion.B:
      return buildV2TranscriptionPrompt(speakers, options);
    case TranscriptionVersion.A:
    default:
      return buildV1TranscriptionPrompt(speakers, options);
  }
}

/**
 * Version 1 of the transcription prompt (original)
 */
function buildV1TranscriptionPrompt(speakers: Speaker[], options: TranscriptionOptions = {}): string {
  // Render each speaker mapping line
  const speakerLines = speakers
    .map((s, i) => `   - Replace "Speaker ${i + 1}" with "${s.name}" (${s.role})`)
    .join('\n');

  return `Analyze the provided audio file to perform speaker diarization and generate accurate timestamps.

Instructions:
1. Identify each distinct speaker in the conversation using the provided speaker information:
${speakerLines}
2. Determine the precise start time for each speaker's utterance based on the source timing.
3. Format the output with each utterance on a new line, starting with the accurate timestamp in MM:SS format, followed by the speaker's name and a colon.

Example Output Format:
00:05 ${speakers[0]?.name || 'Speaker'}: [utterance]
00:09 ${speakers[1]?.name || 'Speaker'}: [utterance]
01:15 ${speakers[0]?.name || 'Speaker'}: [utterance]`;
}

/**
 * Version 2 of the transcription prompt (with enhanced instructions for clarity and precision)
 */
function buildV2TranscriptionPrompt(speakers: Speaker[], options: TranscriptionOptions = {}): string {
  // Render each speaker mapping line
  const speakerLines = speakers
    .map((s, i) => `   • ${s.name} (${s.role})`)
    .join('\n');

  const includeTimestamps = options.includeTimestamps !== false;
  const formatStyle = options.formatStyle || 'detailed';
  
  return `Transcribe the provided audio file with accurate speaker identification and timestamps.

SPEAKER INFORMATION:
${speakerLines}

TRANSCRIPTION INSTRUCTIONS:
1. Listen carefully to distinguish between different speakers
2. Label each utterance with the correct speaker name from the list above
3. ${includeTimestamps ? 'Include precise MM:SS timestamps before each speaker change' : 'Do not include timestamps'}
4. Capture all speech accurately, including hesitations, corrections and pauses ${formatStyle === 'detailed' ? '(indicated with ellipses ...)' : ''}
5. For unintelligible speech, use [inaudible] marker

FORMAT EXAMPLE:
${includeTimestamps ? `00:05 ${speakers[0]?.name || 'Speaker 1'}: I wanted to discuss the performance improvement plan today.
00:15 ${speakers[1]?.name || 'Speaker 2'}: Yes, I've reviewed the documentation you sent.` 
: `${speakers[0]?.name || 'Speaker 1'}: I wanted to discuss the performance improvement plan today.
${speakers[1]?.name || 'Speaker 2'}: Yes, I've reviewed the documentation you sent.`}

Use clear paragraph breaks between different topics or significant pauses in conversation.`;
}

/**
 * Helper to determine which prompt version to use based on environment variables
 */
function determinePromptVersion(): SummarizeVersion {
  // Use environment variable to select prompt version, defaulting to version A
  const versionString = process.env.PROMPT_VARIANT_SUMMARIZE?.toLowerCase();
  
  if (versionString === 'v2' || versionString === 'b') {
    return SummarizeVersion.B;
  }
  
  return SummarizeVersion.A;
}

/**
 * Helper to determine which transcription prompt version to use based on environment variables
 */
function determineTranscriptionVersion(): TranscriptionVersion {
  // Use environment variable to select prompt version, defaulting to version A
  const versionString = process.env.PROMPT_VARIANT_TRANSCRIBE?.toLowerCase();
  
  if (versionString === 'v2' || versionString === 'b') {
    return TranscriptionVersion.B;
  }
  
  return TranscriptionVersion.A;
}