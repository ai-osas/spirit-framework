import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Required for client-side usage
});

interface LearningPattern {
  topic: string;
  description: string;
  relatedConcepts: string[];
  confidence: number;
  isShared: boolean;
  creator: string;
  id: number;
  inPrivateCollection?: boolean;
}

export async function analyzeLearningPatterns(entries: { 
  title: string; 
  content: string;
  isShared: boolean;
  creator: string;
  id: number;
}[]): Promise<LearningPattern[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at analyzing learning patterns and knowledge connections. Your task is to identify genuine learning patterns from journal entries by following these strict criteria:

1. Learning Pattern Identification:
   - Must contain clear evidence of learning or skill development
   - Should demonstrate progression of understanding
   - Must have specific concepts or topics being explored
   - Should show reflection or application of knowledge

2. Related Concepts Analysis:
   - Only include concepts that are semantically connected to the main topic
   - Must be based on actual content, not assumed connections
   - Should represent different aspects or subtopics of the learning area
   - Maximum of 5 related concepts per pattern

3. Confidence Scoring:
   - Only return patterns with confidence > 0.7
   - Base confidence on:
     * Depth of learning content
     * Clarity of concept relationships
     * Evidence of reflection or understanding
     * Presence of specific examples or applications

Do not identify patterns in entries that:
- Are too brief or superficial
- Lack specific learning content
- Are purely personal reflections without learning elements
- Contain only statements without evidence of understanding`,
        },
        {
          role: "user",
          content: `Analyze these journal entries and identify learning patterns. For each pattern, provide related concepts that are semantically connected:

${entries.map(entry => `Title: ${entry.title}\nContent: ${entry.content}\n---`).join('\n')}

Respond with JSON in this format:
{
  "patterns": [
    {
      "topic": "Main topic or concept being learned",
      "description": "Description of the learning pattern, evidence of understanding, and key insights",
      "relatedConcepts": ["list", "of", "related", "concepts"],
      "confidence": 0.95,
      "isShared": false,
      "creator": "wallet_address",
      "id": 1,
      "inPrivateCollection": false
    }
  ]
}

Only include entries where you have high confidence (>0.7) that they represent actual learning content.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{"patterns": []}');

    // Map the entries metadata to the patterns
    return result.patterns.map((pattern: LearningPattern, index: number) => ({
      ...pattern,
      isShared: entries[index]?.isShared || false,
      creator: entries[index]?.creator || '',
      id: entries[index]?.id || 0,
      inPrivateCollection: false // This will be updated based on the collection status
    }));
  } catch (error) {
    console.error('Failed to analyze learning patterns:', error);
    return [];
  }
}