#!/bin/bash

# Create a conversation between manager and HR about performance issues
# Uses macOS built-in say command with temporary files

# Create temp directory
mkdir -p temp

# Generate the manager's parts
echo "Thanks for meeting with me today. I wanted to discuss some performance concerns I have with Alex from the marketing team." > temp/manager1.txt
echo "Over the last quarter, Alex has missed several important deadlines. The quality of work has also declined compared to previous performance." > temp/manager2.txt
echo "Yes, we had an informal chat about a month ago. There was some improvement initially, but things have slipped again. I'm also concerned about some team dynamics issues." > temp/manager3.txt
echo "Alex seems increasingly disengaged in team meetings and has been somewhat abrupt with colleagues. A couple of team members have mentioned feeling uncomfortable with some interactions." > temp/manager4.txt
echo "I've been keeping notes of missed deadlines and specific instances where work quality didn't meet expectations. I have emails showing the follow-ups needed." > temp/manager5.txt
echo "Yes, that's what I was thinking. I want to be supportive while also being clear about expectations." > temp/manager6.txt
echo "What should I prepare for the initial PIP meeting?" > temp/manager7.txt
echo "Got it. I'd like Alex to succeed, but I also need to make sure the team's work isn't negatively impacted." > temp/manager8.txt
echo "Perfect. I appreciate your guidance on this." > temp/manager9.txt

# Generate the HR parts
echo "Of course. What specific issues have you been observing?" > temp/hr1.txt
echo "I see. Have you already had conversations with Alex about these concerns?" > temp/hr2.txt
echo "Could you elaborate on those team dynamics?" > temp/hr3.txt
echo "That's definitely worth addressing. What steps have you taken to document these performance issues?" > temp/hr4.txt
echo "That's great. Documentation is important. Based on what you're sharing, it sounds like we need to initiate a Performance Improvement Plan." > temp/hr5.txt
echo "Absolutely. We need to outline specific, measurable goals for improvement, establish a reasonable timeframe, and schedule regular check-ins." > temp/hr6.txt
echo "You'll need concrete examples of the performance issues, clear expectations moving forward, and specific metrics for measuring improvement. We should also discuss what support or resources Alex might need." > temp/hr7.txt
echo "That's the right approach. We'll aim to be constructive while making the consequences clear if improvements aren't made. I can help you draft the formal PIP document by the end of the week." > temp/hr8.txt
echo "No problem. That's what I'm here for. Let's schedule a follow-up meeting to review the draft PIP before presenting it to Alex." > temp/hr9.txt

# Generate audio files
for i in {1..9}; do
  say -v Daniel -o temp/manager$i.aiff -f temp/manager$i.txt
  say -v Samantha -o temp/hr$i.aiff -f temp/hr$i.txt
  echo "Generated audio part $i"
done

# Combine all files
echo "Creating combined MP3 file..."

# Create a list of all audio files in order
(
  echo "file 'manager1.aiff'"
  echo "file 'hr1.aiff'"
  echo "file 'manager2.aiff'"
  echo "file 'hr2.aiff'"
  echo "file 'manager3.aiff'"
  echo "file 'hr3.aiff'"
  echo "file 'manager4.aiff'"
  echo "file 'hr4.aiff'"
  echo "file 'manager5.aiff'"
  echo "file 'hr5.aiff'"
  echo "file 'manager6.aiff'"
  echo "file 'hr6.aiff'"
  echo "file 'manager7.aiff'"
  echo "file 'hr7.aiff'"
  echo "file 'manager8.aiff'"
  echo "file 'hr8.aiff'"
  echo "file 'manager9.aiff'"
  echo "file 'hr9.aiff'"
) > temp/filelist.txt

# Move to temp directory to run ffmpeg
cd temp

# Convert to MP3 using ffmpeg
ffmpeg -f concat -safe 0 -i filelist.txt -c:a libmp3lame -q:a 2 ../performance_discussion.mp3

echo "Conversation audio created: performance_discussion.mp3"

# Clean up
cd ..
# rm -rf temp 