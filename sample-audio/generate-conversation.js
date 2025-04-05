// Sample conversation generator for performance review audio
// This script generates a simulated conversation between a manager and HR business partner
// Uses Google Text-to-Speech API via the google-tts-api package

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Conversation script - a manager discussing employee performance with HR
const conversationScript = `
MANAGER: Thanks for meeting with me today. I wanted to discuss some performance concerns I have with Alex from the marketing team.

HR: Of course. What specific issues have you been observing?

MANAGER: Over the last quarter, Alex has missed several important deadlines. The quality of work has also declined compared to previous performance.

HR: I see. Have you already had conversations with Alex about these concerns?

MANAGER: Yes, we had an informal chat about a month ago. There was some improvement initially, but things have slipped again. I'm also concerned about some team dynamics issues.

HR: Could you elaborate on those team dynamics?

MANAGER: Alex seems increasingly disengaged in team meetings and has been somewhat abrupt with colleagues. A couple of team members have mentioned feeling uncomfortable with some interactions.

HR: That's definitely worth addressing. What steps have you taken to document these performance issues?

MANAGER: I've been keeping notes of missed deadlines and specific instances where work quality didn't meet expectations. I have emails showing the follow-ups needed.

HR: That's great. Documentation is important. Based on what you're sharing, it sounds like we need to initiate a Performance Improvement Plan.

MANAGER: Yes, that's what I was thinking. I want to be supportive while also being clear about expectations.

HR: Absolutely. We need to outline specific, measurable goals for improvement, establish a reasonable timeframe, and schedule regular check-ins.

MANAGER: What should I prepare for the initial PIP meeting?

HR: You'll need concrete examples of the performance issues, clear expectations moving forward, and specific metrics for measuring improvement. We should also discuss what support or resources Alex might need.

MANAGER: Got it. I'd like Alex to succeed, but I also need to make sure the team's work isn't negatively impacted.

HR: That's the right approach. We'll aim to be constructive while making the consequences clear if improvements aren't made. I can help you draft the formal PIP document by the end of the week.

MANAGER: Perfect. I appreciate your guidance on this.

HR: No problem. That's what I'm here for. Let's schedule a follow-up meeting to review the draft PIP before presenting it to Alex.
`;

// Split the conversation into lines and identify speakers
const parseConversation = (script) => {
  const lines = script.trim().split('\n').filter(line => line.trim() !== '');
  const dialogue = [];
  
  lines.forEach(line => {
    const match = line.match(/^(MANAGER|HR):\s*(.*)/);
    if (match) {
      dialogue.push({
        speaker: match[1],
        text: match[2].trim()
      });
    }
  });
  
  return dialogue;
}

// Generate the conversation audio using text-to-speech
const generateAudio = async () => {
  const dialogue = parseConversation(conversationScript);
  const outputDir = path.join(__dirname);
  
  // Create temp files for each dialogue piece
  const tempFiles = [];
  for (let i = 0; i < dialogue.length; i++) {
    const { speaker, text } = dialogue[i];
    
    // Select voice based on speaker
    const voice = speaker === 'MANAGER' ? 'en-US-Neural2-D' : 'en-US-Neural2-F';
    
    const outputFile = path.join(outputDir, `part_${i.toString().padStart(3, '0')}.mp3`);
    
    // Add a short pause before each line (except the first)
    if (i > 0) {
      const pauseFile = path.join(outputDir, `pause_${i.toString().padStart(3, '0')}.mp3`);
      await execPromise(`ffmpeg -f lavfi -i anullsrc=r=24000:cl=mono -t 0.5 -q:a 9 -acodec libmp3lame ${pauseFile}`);
      tempFiles.push(pauseFile);
    }
    
    // Use Google TTS API to generate speech
    console.log(`Generating speech for ${speaker}: "${text.substring(0, 30)}..."`);
    
    // Using say command for macOS (modify for other platforms)
    await execPromise(`say -v ${speaker === 'MANAGER' ? 'Daniel' : 'Samantha'} -o ${outputFile} "${text}"`);
    tempFiles.push(outputFile);
  }
  
  // Concatenate all audio files
  const fileList = tempFiles.map(file => `file '${file}'`).join('\n');
  const fileListPath = path.join(outputDir, 'filelist.txt');
  fs.writeFileSync(fileListPath, fileList);
  
  // Combine all files into one MP3
  const finalOutput = path.join(outputDir, 'performance_discussion.mp3');
  await execPromise(`ffmpeg -f concat -safe 0 -i ${fileListPath} -c copy ${finalOutput}`);
  
  // Clean up temp files
  tempFiles.forEach(file => fs.unlinkSync(file));
  fs.unlinkSync(fileListPath);
  
  console.log(`Conversation audio generated successfully: ${finalOutput}`);
  return finalOutput;
};

// Run the audio generation
generateAudio().catch(console.error); 