#!/bin/bash

# Create a directory for our temporary files
mkdir -p temp_audio

# Conversation script
cat > conversation.txt << 'EOL'
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
EOL

# Processing each line
counter=0
while IFS= read -r line; do
  # Skip empty lines
  if [ -z "$line" ]; then
    continue
  fi
  
  # Extract speaker and dialogue
  speaker=$(echo "$line" | cut -d':' -f1)
  dialogue=$(echo "$line" | cut -d':' -f2-)
  
  # Select voice based on speaker
  if [ "$speaker" = "MANAGER" ]; then
    voice="Daniel"
  else
    voice="Samantha"
  fi
  
  # Generate audio file
  echo "Generating speech for $speaker..."
  say -v "$voice" -o "temp_audio/part_$counter.aiff" "$dialogue"
  
  counter=$((counter+1))
done < conversation.txt

# Create a list of audio files
find temp_audio -name "part_*.aiff" | sort > temp_audio/filelist.txt

# Create output directory if it doesn't exist
mkdir -p output

# Combine all audio files (requires ffmpeg)
echo "Combining audio files..."
if command -v ffmpeg >/dev/null 2>&1; then
  # Create a file list in the format ffmpeg expects
  sed 's/^/file /' temp_audio/filelist.txt > temp_audio/ffmpeg_filelist.txt
  
  ffmpeg -f concat -safe 0 -i temp_audio/ffmpeg_filelist.txt -c:a libmp3lame -q:a 2 performance_discussion.mp3
  
  echo "Created performance_discussion.mp3"
else
  echo "ffmpeg not found. Installing with Homebrew..."
  brew install ffmpeg
  
  # Create a file list in the format ffmpeg expects
  sed 's/^/file /' temp_audio/filelist.txt > temp_audio/ffmpeg_filelist.txt
  
  ffmpeg -f concat -safe 0 -i temp_audio/ffmpeg_filelist.txt -c:a libmp3lame -q:a 2 performance_discussion.mp3
  
  echo "Created performance_discussion.mp3"
fi

# Clean up temporary files
echo "Cleaning up..."
rm -rf temp_audio conversation.txt

echo "Done! Audio file is ready: performance_discussion.mp3" 