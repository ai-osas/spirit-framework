import { neo4j } from "@hypermode/modus-sdk-as"
import { models } from "@hypermode/modus-sdk-as"
import { EmbeddingsModel } from "@hypermode/modus-sdk-as/models/experimental/embeddings"
import { JSON } from "json-as";

import {
  AnthropicMessagesModel,
  Message,
  UserMessage,
  ToolChoiceTool,
} from "@hypermode/modus-sdk-as/models/anthropic/messages";

@json
class LearningPattern {
  observation: string = "";
  context: string = "";
  timestamp: string = "";
  patternId: string = "";
  embedding: f32[] = [];

  constructor(observation: string, context: string, timestamp: string) {
    this.observation = observation;
    this.context = context;
    this.timestamp = timestamp;
  }
}

@json 
class EvolutionResponse {
    status: string;
    originalId: string;
    evolvedId: string;
    evolutionType: string;
    similarity: f64;

    constructor(
        status: string,
        originalId: string,
        evolvedId: string,
        evolutionType: string,
        similarity: f64
    ) {
        this.status = status;
        this.originalId = originalId;
        this.evolvedId = evolvedId;
        this.evolutionType = evolutionType;
        this.similarity = similarity;
    }
}

@json
class DetectedPattern {
    pattern: string;           // The actual learning pattern identified
    patternType: string;       // How they learn (e.g., "visual metaphor", "spatial reasoning")
    conceptualDomain: string;  // What they're learning about (e.g., "programming", "mathematics")
    confidence: f32;
    
    constructor(
        pattern: string,
        patternType: string,
        conceptualDomain: string,
        confidence: f32
    ) {
        this.pattern = pattern;
        this.patternType = patternType;
        this.conceptualDomain = conceptualDomain;
        this.confidence = confidence;
    }
}

@json
class DetectionResponse {
    hasPattern: boolean;
    pattern: DetectedPattern;
    message: string;
    
    constructor(
        hasPattern: boolean,
        pattern: DetectedPattern,
        message: string
    ) {
        this.hasPattern = hasPattern;
        this.pattern = pattern;
        this.message = message;
    }
}

// Function to embed pattern text - used by both Neo4j and collections
export function embedPattern(texts: string[]): f32[][] {
  const model = models.getModel<EmbeddingsModel>("pattern-embeddings");
  const input = model.createInput(texts);
  const output = model.invoke(input);
  return output.predictions;
}

export function recordLearningPattern(observation: string, context: string): string {
  // First generate embedding - we'll use it for both storages
  const embeddings = embedPattern([observation]);
  if (embeddings.length === 0) {
    return "Failed to generate embedding";
  }
  const embedding = embeddings[0];
  const dbConnection = "learning-patterns-db";
  
  // Create our pattern with current timestamp and embedding
  const pattern = new LearningPattern(
    observation,
    context,
    Date.now().toString()
  );
  pattern.embedding = embedding;
  
  // Create Cypher query to store the pattern
  const query = `
    CREATE (p:Pattern {
      observation: $pattern.observation,
      context: $pattern.context,
      timestamp: $pattern.timestamp,
      embedding: $pattern.embedding
    })
    RETURN id(p) as patternId
  `;
  
  // Set up our parameters
  const vars = new neo4j.Variables();
  vars.set("pattern", pattern);
  
  // Execute the query
  const result = neo4j.executeQuery(dbConnection, query, vars);
  if (!result || result.Records.length === 0) {
      return "Failed to record pattern in Neo4j";
  }

  // Get Neo4j node ID and store it
  const patternId = result.Records[0].get("patternId");
  return "Pattern recorded successfully with ID: " + patternId;
}

export function findSimilarPatterns(observation: string, maxItems: i32): string {
  // Generate embedding for search query
  const embeddings = embedPattern([observation]);
  if (embeddings.length === 0) {
      return "Failed to generate embedding";
  }
  const embedding = embeddings[0];
  
  const dbConnection = "learning-patterns-db";
  
  // Query using vector similarity
  const query = `
      MATCH (p:Pattern)
      WITH p,
           vector.similarity.cosine(p.embedding, $embedding) AS score
      WHERE score > 0.7  // Similarity threshold
      RETURN p.observation as observation,
             p.context as context,
             id(p) as patternId,
             score,
             1 - score as distance  // Convert similarity to distance
      ORDER BY score DESC
      LIMIT toInteger($maxItems)
  `;
  
  const vars = new neo4j.Variables();
  vars.set("embedding", embedding);
  vars.set("maxItems", maxItems);
  
  const result = neo4j.executeQuery(dbConnection, query, vars);
  
  if (!result || result.Records.length === 0) {
      return "[]";
  }
  
  let output = "[";
  for (let i = 0; i < result.Records.length; i++) {
      const record = result.Records[i];
      if (i > 0) output += ",";
      output += "{";
      output += `"observation":"${record.get("observation")}",`;
      output += `"context":"${record.get("context")}",`;
      output += `"patternId":${record.get("patternId")},`;
      output += `"similarity":${record.get("score")},`;
      output += `"distance":${record.get("distance")}`;
      output += "}";
  }
  output += "]";
  
  return output;
}

export function trackPatternEvolution(
  originalObservation: string,
  evolvedObservation: string,
  evolutionContext: string
): string {
  const dbConnection = "learning-patterns-db";
  
  // Generate embeddings for comparison
  const embeddings = embedPattern([originalObservation, evolvedObservation]);
  if (embeddings.length < 2) {
      return "Failed to generate embeddings";
  }

  // Analyze evolution type using Claude
  const model = models.getModel<AnthropicMessagesModel>("text-generator");
  const analysisPrompt = [
      "Original Learning Pattern: ", originalObservation, "\n",
      "Evolved Pattern: ", evolvedObservation, "\n",
      "Context: ", evolutionContext, "\n\n",
      "Analyze how this learning pattern has evolved. Respond with exactly one word from these options: refinement, merge, or branch.\n",
      "refinement = improvement of existing pattern\n",
      "merge = combining patterns\n",
      "branch = new direction from existing pattern"
  ].join("");

  const messages: Message[] = [
      new UserMessage(analysisPrompt)
  ];

  const input = model.createInput(messages);
  input.system = "You analyze learning pattern evolution types. Respond with exactly one word: refinement, merge, or branch.";
  input.maxTokens = 50;
  input.temperature = 0.2;  // Lower temperature for more consistent categorization

  const output = model.invoke(input);
  if (output.content.length !== 1) {
      return "Failed to analyze pattern evolution";
  }

  const evolutionType = output.content[0].type === "text" ? 
      output.content[0].text!.trim().toLowerCase() : 
      "refinement"; // default fallback

  // Create Cypher query
  const query = `
      MATCH (original:Pattern)
      WHERE vector.similarity.cosine(original.embedding, $originalEmbedding) > 0.8
      WITH original ORDER BY vector.similarity.cosine(original.embedding, $originalEmbedding) DESC LIMIT 1
      CREATE (evolved:Pattern {
          observation: $evolvedObservation,
          context: $context,
          timestamp: datetime(),
          embedding: $evolvedEmbedding
      })
      CREATE (original)-[evolution:EVOLVED_INTO {
          type: $evolutionType,
          context: $evolutionContext,
          timestamp: datetime(),
          similarityScore: vector.similarity.cosine($originalEmbedding, $evolvedEmbedding)
      }]->(evolved)
      RETURN 
          id(original) as originalId,
          id(evolved) as evolvedId,
          evolution.type as evolutionType,
          evolution.similarityScore as similarity
  `;

  const vars = new neo4j.Variables();
  vars.set("originalEmbedding", embeddings[0]);
  vars.set("evolvedEmbedding", embeddings[1]);
  vars.set("evolvedObservation", evolvedObservation);
  vars.set("context", evolutionContext);
  vars.set("evolutionContext", evolutionContext);
  vars.set("evolutionType", evolutionType);

  const result = neo4j.executeQuery(dbConnection, query, vars);
  if (!result || result.Records.length === 0) {
      return "Failed to track pattern evolution";
  }

  const record = result.Records[0];
  const response = new EvolutionResponse(
      "success",
      record.get("originalId"),
      record.get("evolvedId"),
      record.get("evolutionType"),
      parseFloat(record.get("similarity")) as f64
    );

  return JSON.stringify(response);
}


export function detectLearningPatterns(userMessage: string): string {
    // Create an empty pattern for error cases
    const emptyPattern = new DetectedPattern(
        "",           // pattern
        "",           // patternType
        "",           // conceptualDomain
        0.0          // confidence
    );
  const model = models.getModel<AnthropicMessagesModel>("text-generator");
  
  const systemPrompt = `You are a learning pattern detection system based on the Spirit Framework. 
  Analyze the user's message for natural learning patterns, especially how they uniquely understand or visualize concepts.
  
  Focus on identifying:
  1. Natural ways people process and understand information
  2. Personal metaphors or visualizations
  3. Unique approaches to learning or explaining concepts
  
  Only identify a pattern if it clearly shows how someone learns or understands. Don't force pattern detection.
  
  Respond in this JSON format:
  {
      "hasPattern": true/false,
      "pattern": {
          "pattern": "detailed description of the learning pattern",
          "patternType": "how they learn (e.g., visual metaphor, spatial reasoning)",
          "conceptualDomain": "what domain this applies to",
          "confidence": 0.0-1.0
      },
      "message": "explanation of why this is or isn't a learning pattern"
  }`;

  const messages: Message[] = [
      new UserMessage([
          "Analyze this message for learning patterns:\n\n",
          userMessage
      ].join(""))
  ];

  const input = model.createInput(messages);
  input.system = systemPrompt;
  input.maxTokens = 1000;
  input.temperature = 0.1; // Keep very low for consistent analysis

  const output = model.invoke(input);
  if (output.content.length === 0) {
      return JSON.stringify(new DetectionResponse(
          false,
          emptyPattern,
          "Failed to analyze message for patterns"
      ));
  }

  const responseText = output.content[0].type === "text" ? 
      output.content[0].text! : 
      "{}";

  const detection = JSON.parse<DetectionResponse>(responseText);

  
  
  // Validate if a pattern was detected
  if (detection.hasPattern && detection.pattern ) {
      const pattern = detection.pattern;
      
      // Basic validation
      if (pattern.confidence < 0 || pattern.confidence > 1) {
          return JSON.stringify(new DetectionResponse(
              false,
              emptyPattern,
              "Invalid pattern confidence value"
          ));
      }
      
      // Only accept high-confidence patterns
      if (pattern.confidence < 0.7) {
          return JSON.stringify(new DetectionResponse(
              false,
              emptyPattern,
              "Pattern detected but confidence too low"
          ));
      }
  }

  return responseText;
}
