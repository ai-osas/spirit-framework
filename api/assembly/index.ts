import { neo4j } from "@hypermode/modus-sdk-as"
import { models } from "@hypermode/modus-sdk-as"
import { collections } from "@hypermode/modus-sdk-as"
import { EmbeddingsModel } from "@hypermode/modus-sdk-as/models/experimental/embeddings"


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
  // TODO: Properly format result
  return result;
}