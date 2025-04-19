import { 
  buildSummarizationPrompt, 
  buildTranscriptionPrompt, 
  SummarizeVersion,
  TranscriptionVersion,
  Speaker 
} from '@/lib/prompts';

describe('Prompt Builders', () => {
  describe('buildSummarizationPrompt', () => {
    it('should include the transcript in the prompt (version A)', () => {
      const transcript = 'This is a test transcript';
      const prompt = buildSummarizationPrompt(transcript, SummarizeVersion.A);
      
      expect(prompt).toContain(transcript);
    });
    
    it('should include key sections in the prompt (version A)', () => {
      const prompt = buildSummarizationPrompt('Test', SummarizeVersion.A);
      
      expect(prompt).toContain('Main topic and purpose');
      expect(prompt).toContain('Key points discussed');
      expect(prompt).toContain('Action items or decisions');
      expect(prompt).toContain('bullet points for readability');
    });

    it('should include the transcript in the prompt (version B)', () => {
      const transcript = 'This is a test transcript';
      const prompt = buildSummarizationPrompt(transcript, SummarizeVersion.B);
      
      expect(prompt).toContain(transcript);
    });
    
    it('should include key sections in the prompt (version B)', () => {
      const prompt = buildSummarizationPrompt('Test', SummarizeVersion.B);
      
      expect(prompt).toContain('Meeting Overview');
      expect(prompt).toContain('Key Discussion Points');
      expect(prompt).toContain('Action Items & Decisions');
    });

    it('should respect the includeHeadings option in version B', () => {
      const promptWithHeadings = buildSummarizationPrompt('Test', SummarizeVersion.B, { includeHeadings: true });
      const promptWithoutHeadings = buildSummarizationPrompt('Test', SummarizeVersion.B, { includeHeadings: false });
      
      // With headings should have markdown format
      expect(promptWithHeadings).toContain('## Meeting Overview');
      
      // Without headings should have plain text format
      expect(promptWithoutHeadings).toContain('Meeting Overview:');
      expect(promptWithoutHeadings).not.toContain('## Meeting Overview');
    });
  });
  
  describe('buildTranscriptionPrompt', () => {
    const mockSpeakers: Speaker[] = [
      { name: 'John', role: 'Manager' },
      { name: 'Alice', role: 'Employee' }
    ];
    
    it('should include speaker information correctly (version A)', () => {
      const prompt = buildTranscriptionPrompt(mockSpeakers, TranscriptionVersion.A);
      
      expect(prompt).toContain('Replace "Speaker 1" with "John" (Manager)');
      expect(prompt).toContain('Replace "Speaker 2" with "Alice" (Employee)');
    });
    
    it('should include formatting instructions (version A)', () => {
      const prompt = buildTranscriptionPrompt(mockSpeakers, TranscriptionVersion.A);
      
      expect(prompt).toContain('timestamp in MM:SS format');
      expect(prompt).toContain('Example Output Format');
      expect(prompt).toContain('John: [utterance]');
    });
    
    it('should handle empty speakers array (version A)', () => {
      const prompt = buildTranscriptionPrompt([], TranscriptionVersion.A);
      
      // Should still generate a valid prompt with default speaker
      expect(prompt).toContain('Speaker: [utterance]');
    });

    it('should include speaker information correctly (version B)', () => {
      const prompt = buildTranscriptionPrompt(mockSpeakers, TranscriptionVersion.B);
      
      expect(prompt).toContain('• John (Manager)');
      expect(prompt).toContain('• Alice (Employee)');
    });
    
    it('should respect options in version B', () => {
      const promptWithTimestamps = buildTranscriptionPrompt(
        mockSpeakers, 
        TranscriptionVersion.B, 
        { includeTimestamps: true }
      );
      const promptWithoutTimestamps = buildTranscriptionPrompt(
        mockSpeakers, 
        TranscriptionVersion.B, 
        { includeTimestamps: false }
      );
      
      expect(promptWithTimestamps).toContain('Include precise MM:SS timestamps');
      expect(promptWithoutTimestamps).toContain('Do not include timestamps');
    });
  });
});