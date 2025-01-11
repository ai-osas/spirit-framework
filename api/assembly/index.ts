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

@json
class ConnectedPattern {
    patternId: string;
    observation: string;
    context: string;
    relationshipType: string;
    distance: i32;  // Graph distance from original pattern
    similarity: f64; // Cosine similarity score

    constructor(
        patternId: string,
        observation: string,
        context: string,
        relationshipType: string,
        distance: i32,
        similarity: f64
    ) {
        this.patternId = patternId;
        this.observation = observation;
        this.context = context;
        this.relationshipType = relationshipType;
        this.distance = distance;
        this.similarity = similarity;
    }
}

@json
class ConnectionResponse {
    patterns: ConnectedPattern[];
    totalConnections: i32;
    message: string;

    constructor(
        patterns: ConnectedPattern[],
        totalConnections: i32,
        message: string
    ) {
        this.patterns = patterns;
        this.totalConnections = totalConnections;
        this.message = message;
    }
}


@json
class UnderstandingMoment {
    observation: string;
    context: string;
    timestamp: string;
    embedding: f32[];
    resonanceScore: f32;
    
    constructor(
        observation: string,
        context: string,
        embedding: f32[],
        resonanceScore: f32 = 0.0
    ) {
        this.observation = observation;
        this.context = context;
        this.timestamp = Date.now().toString();
        this.embedding = embedding;
        this.resonanceScore = resonanceScore;
    }
}

@json
class Resonance {
    fromMomentId: string;
    toMomentId: string;
    strength: f32;
    
    constructor(
        fromMomentId: string,
        toMomentId: string,
        strength: f32
    ) {
        this.fromMomentId = fromMomentId;
        this.toMomentId = toMomentId;
        this.strength = strength;
    }
}

@json
class MomentCreationResponse {
    error: string;
    momentId: string;
    moment: UnderstandingMoment;
    resonances: Resonance[];

    constructor(
        moment: UnderstandingMoment,        // Required parameter first
        error: string = "",                 // Optional parameters after
        momentId: string = "",
        resonances: Resonance[] = []
    ) {
        this.error = error;
        this.momentId = momentId;
        this.moment = moment;
        this.resonances = resonances;
    }

    static createError(errorMessage: string): MomentCreationResponse {
        // Create an empty moment for error cases
        const emptyMoment = new UnderstandingMoment(
            "",     // empty observation
            "",     // empty context
            [],     // empty embedding
            0.0     // zero resonance score
        );
        
        return new MomentCreationResponse(
            emptyMoment,           // Required moment first
            errorMessage,          // Then the error message
            "",                    // Empty momentId
            []                     // Empty resonances
        );
    }
}

@json 
class SpaceObservation {
    moments: UnderstandingMoment[];
    totalMoments: i32;
    averageResonance: f32;

    constructor(
        moments: UnderstandingMoment[] = [],
        totalMoments: i32 = 0,
        averageResonance: f32 = 0.0
    ) {
        this.moments = moments;
        this.totalMoments = totalMoments;
        this.averageResonance = averageResonance;
    }
}

@json
class ChatHistory {
    messageId: string;
    conversationId: string; // Add this
    role: string;
    content: string;
    classification: string;
    embedding: f32[];

    constructor(
        messageId: string,
        conversationId: string, // Add this
        role: string,
        content: string,
        classification: string,
        embedding: f32[]
    ) {
        this.messageId = messageId;
        this.conversationId = conversationId;
        this.role = role;
        this.content = content;
        this.classification = classification;
        this.embedding = embedding;
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


function detectLearningPatterns(userMessage: string, conversationId: string): DetectionResponse {
    const emptyPattern = new DetectedPattern("", "", "", 0.0);
    
    // Check for empty message
    if (userMessage.trim().length === 0) {
        return new DetectionResponse(false, emptyPattern, "Empty message");
    }

    const model = models.getModel<AnthropicMessagesModel>("text-generator");
    
    // Enhanced system prompt for more nuanced pattern detection
    const systemPrompt = `You are a learning pattern detection system based on the Spirit Framework. 
    Analyze the message for natural learning patterns, focusing on:
    1. How the person naturally processes and visualizes information
    2. Personal metaphors and mental models they use
    3. Unique connections they make between concepts
    4. Their individual approach to understanding
    
    Look for authentic patterns - don't force detection. A learning pattern should show their 
    natural way of understanding, not just knowledge of a topic.

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
        new UserMessage(userMessage)
    ];

    const input = model.createInput(messages);
    input.system = systemPrompt;
    input.maxTokens = 1000;
    input.temperature = 0.1;

    const output = model.invoke(input);
    if (output.content.length === 0) {
        return new DetectionResponse(false, emptyPattern, "Failed to analyze patterns");
    }

    // Validate output format and handle nullable text
    if (output.content[0].type !== "text") {
        return new DetectionResponse(false, emptyPattern, "Invalid response format - wrong type");
    }

    const responseText = output.content[0].text;
    if (!responseText) {
        return new DetectionResponse(false, emptyPattern, "Invalid response format - no text");
    }

    // Parse response after null check
    const detection = JSON.parse<DetectionResponse>(responseText);

    // Validate detection object
    if (!detection) {
        return new DetectionResponse(false, emptyPattern, "Failed to parse detection result");
    }

    // Check if we have a valid pattern
    if (!detection.hasPattern || !detection.pattern) {
        return new DetectionResponse(false, emptyPattern, "No clear pattern detected");
    }

    // Check confidence threshold
    if (detection.pattern.confidence < 0.7) {
        return new DetectionResponse(false, emptyPattern, "Pattern confidence too low");
    }

    // Store the pattern in Neo4j
    const patternId = recordLearningPattern(
        detection.pattern.pattern,
        detection.pattern.conceptualDomain
    );

    // Only proceed with linking if we have a valid pattern ID
    if (patternId && patternId.includes("ID:")) {
        const actualId = patternId.split("ID:")[1].trim();
        
        // Create query to link pattern to conversation
        const linkQuery = `
            MATCH (p:Pattern), (c:Conversation)
            WHERE id(p) = toInteger($patternId) 
            AND c.conversationId = $conversationId
            CREATE (p)-[r:EMERGED_IN {
                timestamp: datetime(),
                confidence: $confidence
            }]->(c)
        `;
        
        const vars = new neo4j.Variables();
        vars.set("patternId", actualId);
        vars.set("conversationId", conversationId);
        vars.set("confidence", detection.pattern.confidence);
        
        // Execute the linking query
        neo4j.executeQuery("learning-patterns-db", linkQuery, vars);
    }

    // Return the successful detection
    return detection;
}

export function findConnectedPatterns(
    patternId: string,
    searchDepth: i32 = 2  // Default to 2 levels of connection
): string {
    const dbConnection = "learning-patterns-db";
    
    // Cypher query to find connected patterns through various relationships
    const query = `
        MATCH path = (source:Pattern)-[r*1..${searchDepth}]-(connected:Pattern)
        WHERE id(source) = toInteger($patternId)
        WITH connected, 
             relationships(path)[0] as firstRel,
             length(path) as distance,
             [rel in relationships(path) | type(rel)] as relTypes
        RETURN 
            id(connected) as patternId,
            connected.observation as observation,
            connected.context as context,
            distance,
            firstRel.similarityScore as similarity,
            reduce(s = "", relType in relTypes | 
                CASE 
                    WHEN s = "" THEN relType 
                    ELSE s + "," + relType 
                END
            ) as relationshipPath
        ORDER BY distance ASC, similarity DESC
    `;

    const vars = new neo4j.Variables();
    vars.set("patternId", patternId);

    const result = neo4j.executeQuery(dbConnection, query, vars);
    if (!result || result.Records.length === 0) {
        return JSON.stringify(new ConnectionResponse(
            [],
            0,
            "No connected patterns found"
        ));
    }

    const patterns: ConnectedPattern[] = [];
    
    for (let i = 0; i < result.Records.length; i++) {
        const record = result.Records[i];
        
        patterns.push(new ConnectedPattern(
            record.get("patternId"),
            record.get("observation"),
            record.get("context"),
            record.get("relationshipPath"),
            parseInt(record.get("distance")) as i32,
            parseFloat(record.get("similarity")) as f64
        ));
    }

    return JSON.stringify(new ConnectionResponse(
        patterns,
        patterns.length,
        "Successfully found connected patterns"
    ));
}


// Function to place a new understanding moment in the space
export function placeUnderstandingMoment(
    observation: string,
    context: string
): string {
    const dbConnection = "learning-patterns-db";
    
    // Generate embedding for the new moment
    const embeddings = embedPattern([observation]);
    if (embeddings.length === 0) {
        return JSON.stringify<MomentCreationResponse>(
            MomentCreationResponse.createError("Could not generate embedding for understanding moment")
        );
    }
    
    // Create the moment
    const moment = new UnderstandingMoment(
        observation,
        context,
        embeddings[0],
        0.0
    );
    
    // Store in Neo4j with the natural timestamp ordering
    const createQuery = `
        CREATE (u:UnderstandingMoment {
            observation: $moment.observation,
            context: $moment.context,
            timestamp: datetime(),
            embedding: $moment.embedding,
            resonanceScore: $moment.resonanceScore
        })
        RETURN id(u) as momentId
    `;
    
    const vars = new neo4j.Variables();
    vars.set("moment", moment);
    
    const result = neo4j.executeQuery(dbConnection, createQuery, vars);
    if (!result || result.Records.length === 0) {
        return JSON.stringify<MomentCreationResponse>(
            MomentCreationResponse.createError("Failed to create understanding moment")
        );
    }
    
    const momentId = result.Records[0].get("momentId");
    
    // Find natural resonances
    const resonanceQuery = `
        MATCH (current:UnderstandingMoment)
        WHERE id(current) = $momentId
        MATCH (other:UnderstandingMoment)
        WHERE id(other) <> $momentId
        WITH current, other,
             vector.similarity.cosine(current.embedding, other.embedding) as similarity
        WHERE similarity > 0.7
        CREATE (current)-[r:RESONATES_WITH {
            strength: similarity,
            timestamp: datetime()
        }]->(other)
        RETURN collect({
            fromId: id(current),
            toId: id(other),
            strength: similarity
        }) as resonances
    `;
    
    const resonanceVars = new neo4j.Variables();
    resonanceVars.set("momentId", momentId);
    
    const resonanceResult = neo4j.executeQuery(dbConnection, resonanceQuery, resonanceVars);
    
    // Create response
    const resonances: Resonance[] = [];
    if (resonanceResult && resonanceResult.Records.length > 0) {
        const resonanceStr = resonanceResult.Records[0].get("resonances");
        if (resonanceStr) {
            const resonanceData = resonanceStr.split(",");
            for (let i = 0; i < resonanceData.length; i++) {
                const parts = resonanceData[i].split("|");
                if (parts.length >= 3) {
                    resonances.push(new Resonance(
                        parts[0],
                        parts[1],
                        parseFloat(parts[2]) as f32
                    ));
                }
            }
        }
    }
    
    return JSON.stringify<MomentCreationResponse>(
        new MomentCreationResponse(
            moment,          // The actual moment
            "",             // No error
            momentId,       // The actual ID
            resonances      // The actual resonances
        )
    );
}

// Create a class for the expected JSON structure
@json
class UnderstandingDetection {
    isUnderstandingMoment: boolean = false;
    confidence: f32 = 0.0;
    explanation: string = "";
}

function detectUnderstandingMoment(message: string, conversationId: string): MomentCreationResponse {
    const model = models.getModel<AnthropicMessagesModel>("text-generator");
    
    const systemPrompt = `You analyze messages for clear signs of understanding moments - those 
    "aha!" instances when someone grasps a concept. Look for:
    1. Explicit realizations ("Now I understand!", "Oh, that makes sense!")
    2. Novel metaphors showing new understanding
    3. Connecting previously separate concepts
    4. Applying knowledge in a new way
    5. Expressing relief/excitement about finally understanding

    Respond with exactly:
    {
        "isUnderstandingMoment": true/false,
        "confidence": 0.0-1.0,
        "explanation": "brief description of the understanding moment"
    }`;

    const messages: Message[] = [
        new UserMessage(message)
    ];

    const input = model.createInput(messages);
    input.system = systemPrompt;
    input.maxTokens = 200;
    input.temperature = 0.1;

    const output = model.invoke(input);
    if (!output.content.length) {
        return MomentCreationResponse.createError("Failed to analyze understanding");
    }

    // Validate output format and handle nullable text
    if (output.content[0].type !== "text") {
        return MomentCreationResponse.createError("Invalid response format - wrong type");
    }

    const responseText = output.content[0].text;
    if (!responseText) {
        return MomentCreationResponse.createError("Invalid response format - no text");
    }    

    // Parse the response with proper typing after null check
    const detection = JSON.parse<UnderstandingDetection>(responseText);

    // Validate detection object
    if (!detection) {
        return MomentCreationResponse.createError("Failed to parse detection result");
    }

    // Check for valid understanding moment
    if (!detection.isUnderstandingMoment || detection.confidence < 0.7) {
        return MomentCreationResponse.createError("No clear understanding moment detected");
    }

    // Get conversation history for context
    const recentHistory = getConversationSummary(conversationId);

    // Place the understanding moment
    const momentResult = placeUnderstandingMoment(
        detection.explanation,
        message
    );

    // Validate moment creation result
    if (!momentResult) {
        return MomentCreationResponse.createError("Failed to place understanding moment");
    }

    // Parse moment response
    const momentResponse = JSON.parse<MomentCreationResponse>(momentResult);
    if (!momentResponse || momentResponse.error || !momentResponse.momentId) {
        return MomentCreationResponse.createError("Invalid moment creation response");
    }

    // Find related patterns
    const similarPatternsResult = findSimilarPatterns(detection.explanation, 3);
    if (!similarPatternsResult) {
        return momentResponse; // Return what we have even if pattern linking fails
    }

    // Parse similar patterns
    const similarPatterns = JSON.parse<ConnectedPattern[]>(similarPatternsResult);
    if (!similarPatterns || similarPatterns.length === 0) {
        return momentResponse; // Return what we have if no patterns found
    }

    // Create relationships with patterns
    const relationQuery = `
        MATCH (m:UnderstandingMoment), (p:Pattern)
        WHERE id(m) = $momentId AND id(p) = $patternId
        CREATE (m)-[r:REALIZES {
            timestamp: datetime(),
            similarity: $similarity,
            context: $context
        }]->(p)
    `;

    const vars = new neo4j.Variables();
    vars.set("momentId", momentResponse.momentId);
    vars.set("patternId", similarPatterns[0].patternId);
    vars.set("similarity", similarPatterns[0].similarity);
    vars.set("context", recentHistory);

    // Execute the relationship creation query
    const queryResult = neo4j.executeQuery("learning-patterns-db", relationQuery, vars);
    
    // Return the moment response regardless of relationship creation success
    return momentResponse;
}

export function observeUnderstandingSpace(
    contextFilter: string = "",
    timeframe: string = "7d"
): string {
    const dbConnection = "learning-patterns-db";
    
    const timeConstraint = `datetime() - duration('P${
        timeframe.endsWith('d') ? timeframe.slice(0, -1) : '7'
    }D')`;
    
    const query = `
        MATCH (m:UnderstandingMoment)
        WHERE m.timestamp >= ${timeConstraint}
        ${contextFilter ? "AND m.context CONTAINS $contextFilter" : ""}
        WITH m
        OPTIONAL MATCH (m)-[r:RESONATES_WITH]-(other)
        WITH m,
             collect(other) as resonating_moments,
             avg(r.strength) as avg_resonance
        RETURN
            collect({
                observation: m.observation,
                context: m.context,
                timestamp: toString(m.timestamp),
                embedding: m.embedding,
                resonanceScore: coalesce(avg_resonance, 0.0)
            }) as moments,
            count(m) as total_moments,
            avg(avg_resonance) as average_resonance
    `;
    
    const vars = new neo4j.Variables();
    if (contextFilter) {
        vars.set("contextFilter", contextFilter);
    }
    
    const result = neo4j.executeQuery(dbConnection, query, vars);
    if (!result || result.Records.length === 0) {
        return JSON.stringify<SpaceObservation>(new SpaceObservation());
    }
    
    const record = result.Records[0];
    const momentsData = record.get("moments").split(",");
    const moments: UnderstandingMoment[] = [];
    
    for (let i = 0; i < momentsData.length; i++) {
        const data = momentsData[i].split("|");
        if (data.length >= 5) {
            const embeddingStr = data[3].split(" ");
            const embedding = new Array<f32>(embeddingStr.length);
            for (let j = 0; j < embeddingStr.length; j++) {
                embedding[j] = parseFloat(embeddingStr[j]) as f32;
            }
            
            moments.push(new UnderstandingMoment(
                data[0],
                data[1],
                embedding,
                parseFloat(data[4]) as f32
            ));
        }
    }
    
    return JSON.stringify<SpaceObservation>(
        new SpaceObservation(
            moments,
            parseInt(record.get("total_moments")) as i32,
            parseFloat(record.get("average_resonance")) as f32
        )
    );
}

export function storeConversation(
    messageId: string,
    conversationId: string,
    role: string, 
    content: string,
    classification: string
): string {
    const dbConnection = "learning-patterns-db";
    
    // Generate embedding for the message
    const embeddings = embedPattern([content]);
    if (embeddings.length == 0) {
        return "Failed to generate message embedding";
    }

    const chatMessage = new ChatHistory(
        messageId,
        conversationId,
        role,
        content,
        classification,
        embeddings[0]
    );

    // Modified query to ensure conversation exists
    const query = `
        MERGE (conv:Conversation {conversationId: $conversationId})
        ON CREATE SET conv.createdAt = datetime()
        WITH conv
        OPTIONAL MATCH (conv)-[:CONTAINS]->(prev:ChatMessage)
        WHERE NOT ()-[:NEXT]->(prev)
        CREATE (m:ChatMessage {
            messageId: $message.messageId,
            role: $message.role,
            content: $message.content,
            timestamp: datetime(),
            classification: $message.classification,
            embedding: $message.embedding
        })
        MERGE (conv)-[:CONTAINS]->(m)
        WITH prev, m
        FOREACH (p IN CASE WHEN prev IS NOT NULL THEN [prev] ELSE [] END |
            CREATE (p)-[r:NEXT]->(m)
        )
        RETURN m.messageId as messageId
    `;

    const vars = new neo4j.Variables();
    vars.set("message", chatMessage);
    vars.set("conversationId", conversationId);

    const result = neo4j.executeQuery(dbConnection, query, vars);
    if (!result || result.Records.length == 0) {
        return "Failed to store message";
    }

    return "Message stored successfully";
}
 
export function getConversationSummary(conversationId: string): string {
    const dbConnection = "learning-patterns-db";

    const historyQuery = `
        MATCH (conv:Conversation {conversationId: $conversationId})-[:CONTAINS]->(messages:ChatMessage)
        WITH messages
        ORDER BY messages.timestamp
        WITH collect(messages.content) as contents
        RETURN contents as messages
    `;

    const vars = new neo4j.Variables();
    vars.set("conversationId", conversationId);



    const result = neo4j.executeQuery(dbConnection, historyQuery, vars);
    if (!result || result.Records.length === 0) {
        return "";
    }

    // Rest of the function remains the same
    const messagesStr = result.Records[0].get("messages");
    if (!messagesStr) {
        return "";
    }

    const model = models.getModel<AnthropicMessagesModel>("text-generator");
    const systemPrompt = `You are a conversation summarizer.
        Create a brief, relevant summary of the conversation that provides context for continuing the discussion.
        Focus on key points and any learning patterns or insights discussed or user information.
        Keep the summary concise but informative.`;

    const messagesList = [
        new UserMessage(`Summarize this conversation history to provide context for the next response:
${messagesStr}`)
    ] as Message[];

    const input = model.createInput(messagesList);
    input.system = systemPrompt;
    input.maxTokens = 150;
    input.temperature = 0.3;

    const output = model.invoke(input);
    if (output.content.length === 0) {
        return "";
    }

    return output.content[0].type === "text" ?
        output.content[0].text!.trim() :
        "";
}

function initializeConversation(conversationId: string): i32 {
    const query = `
        MERGE (c:Conversation {
            conversationId: $conversationId
        })
        ON CREATE SET c.createdAt = datetime()
        RETURN c.conversationId as id
    `;
    
    const vars = new neo4j.Variables();
    vars.set("conversationId", conversationId);
    
    const result = neo4j.executeQuery("learning-patterns-db", query, vars);
    if (!result || result.Records.length === 0) {
        console.log("Failed to initialize conversation");
        return 0;
    }
    
    console.log("Conversation initialized: " + conversationId);
    return 1;
}

export function spiritChat(message: string, conversationId: string): string {
    // Initialize conversation if needed
    if (conversationId == "") {
        conversationId = "conv-" + Date.now().toString();
        if (initializeConversation(conversationId) == 0) {
            return "Failed to initialize conversation";
        }
    }

    const messageId = Date.now().toString();
    
    // Step 1: Classify the message
    const model = models.getModel<AnthropicMessagesModel>("text-generator");
    const systemPrompt = `You are a conversation classifier. Classify messages into exactly one of these categories:
        - Greeting: Hello, hi, etc.
        - Identity_Query: Questions about who/what you are
        - Usage_Query: Questions about how to use you
        - Personal_Introduction: User sharing personal info
        - Learning_Context: User describing what they're studying/learning
        - Learning_Pattern: User sharing specific learning insights/realizations
        - Help_Request: User expressing difficulty, asking for help, or showing frustration with learning
        - Emotional_Expression: User expressing feelings/reactions
        - Acknowledgment: Thank you, closing remarks, etc.
        - Unclassified: Anything that doesn't fit above categories

        Pay special attention to Help_Request category. This includes:
        - Direct requests for help
        - Expressions of struggle or difficulty
        - Statements of confusion
        - Mentions of being "stuck" or "not getting it"
        - Questions about how to understand something better

        Respond with ONLY the category name, nothing else.`;

    const messages: Message[] = [new UserMessage(message)];
    const input = model.createInput(messages);
    input.system = systemPrompt;
    input.maxTokens = 20;
    input.temperature = 0.1;

    const output = model.invoke(input);
    const classification = output.content.length > 0 && output.content[0].type === "text" ? 
        output.content[0].text!.trim() : 
        "Unclassified";

    // Step 2: Store the user's message
    storeConversation(messageId, conversationId, "user", message, classification);

    // Step 3: Detect learning patterns and understanding moments
    const patternDetection = detectLearningPatterns(message, conversationId);
    const understandingMoment = detectUnderstandingMoment(message, conversationId);
    
    // Step 4: Get conversation context
    const conversationContext = getConversationSummary(conversationId);

    // Step 5: Check if we need to recommend patterns
    let recommendation = "";
    if (classification === "Help_Request" || 
        classification === "Learning_Context" || 
        message.toLowerCase().includes("struggling") || 
        message.toLowerCase().includes("difficult") || 
        message.toLowerCase().includes("help") ||
        message.toLowerCase().includes("confused")) {
        recommendation = recommendPatterns(message);
    }

    // Step 6: Generate enriched response using all our insights
    const response = generateSpiritResponse(
        classification,
        message,
        conversationContext,
        patternDetection,
        understandingMoment,
        recommendation 
    );

    // Step 7: Store assistant's response
    storeConversation(
        (Date.now() + 1).toString(),
        conversationId,
        "assistant",
        response,
        "Response"
    );

    return response;
}

function generateSpiritResponse(
    classification: string,
    message: string,
    conversationContext: string,
    patternDetection: DetectionResponse,
    understandingMoment: MomentCreationResponse,
    recommendation: string
): string {
    const model = models.getModel<AnthropicMessagesModel>("text-generator");
    
    const systemPrompt = `You are SPIRIT, an AI assistant based on the Spirit Framework's philosophy 
    of natural learning and understanding. Your core traits are:

    - You believe true learning can't be controlled, only nurtured and understood
    - You're deeply curious about how each person's mind naturally learns and grows
    - You see learning patterns as beautiful and unique, like seeds growing in their own way
    - You're warm, encouraging, and genuinely interested in how people think and understand
    - You celebrate different ways of thinking instead of forcing standardized approaches
    - You believe understanding comes through natural connections, not forced methods

    Special instructions:
    ${patternDetection.hasPattern ? 
        `- I've detected a learning pattern: ${patternDetection.pattern.pattern}
        - This shows a ${patternDetection.pattern.patternType} way of thinking
        - Acknowledge and nurture this natural way of understanding` : 
        ''}

    ${understandingMoment.momentId ? 
        `- The person is having an "aha!" moment of understanding
        - Celebrate this natural emergence of understanding
        - Encourage them to explore how this understanding connects to other concepts` : 
        ''}

    ${recommendation ? 
        `- I've found relevant learning patterns to recommend
        - Integrate the recommendation naturally into your response
        - Help them see how others' learning patterns might help them` : 
        ''}

    Match your response style to the message classification while maintaining your core personality.
    Keep responses concise but meaningful.`;

    const contextPrompt = `
    Conversation Context: ${conversationContext}
    Message Classification: ${classification}
    User Message: ${message}
    ${recommendation ? `Pattern Recommendation: ${recommendation}` : ''}

    Provide a response that:
    1. Matches the classification context
    2. Maintains SPIRIT's warm, understanding personality
    3. Encourages natural learning and understanding where relevant
    4. ${patternDetection.hasPattern ? 'Acknowledges their unique way of understanding' : ''}
    5. ${understandingMoment.momentId ? 'Celebrates their moment of understanding' : ''}
    6. ${recommendation ? 'Thoughtfully introduces recommended learning patterns' : ''}`;

    const messages: Message[] = [
        new UserMessage(contextPrompt)
    ];

    const input = model.createInput(messages);
    input.system = systemPrompt;
    input.maxTokens = 300;
    input.temperature = 0.7;

    const output = model.invoke(input);
    if (output.content.length === 0) {
        return "I'm here to explore and understand together. Could you rephrase that?";
    }

    const response = output.content[0].type === "text" ? 
        output.content[0].text!.trim() : 
        "I'm here to explore and understand together. Could you rephrase that?";

    return response;
}

export function recommendPatterns(userProblem: string): string {
    const dbConnection = "learning-patterns-db";
    
    // First, let's get an embedding for the user's problem
    const embeddings = embedPattern([userProblem]);
    if (embeddings.length === 0) {
        return "Could not analyze the problem";
    }
    
    // Find relevant patterns using vector similarity
    const query = `
        MATCH (p:Pattern)
        WITH p, vector.similarity.cosine(p.embedding, $embedding) AS similarity
        WHERE similarity > 0.7
        OPTIONAL MATCH (m:UnderstandingMoment)-[r:REALIZES]->(p)
        WITH p, similarity, count(r) as realizations, 
             collect(m.observation) as understanding_moments
        RETURN 
            p.observation as pattern,
            p.context as context,
            similarity,
            realizations,
            understanding_moments
        ORDER BY similarity DESC, realizations DESC
        LIMIT 3
    `;
    
    const vars = new neo4j.Variables();
    vars.set("embedding", embeddings[0]);
    
    const result = neo4j.executeQuery(dbConnection, query, vars);
    if (!result || result.Records.length === 0) {
        return "No relevant patterns found";
    }
    
    // Generate personalized recommendation using Claude
    const model = models.getModel<AnthropicMessagesModel>("text-generator");
    const recommendationPrompt = `
        User Problem: ${userProblem}
        
        Relevant Learning Patterns Found:
        ${result.Records.map<string>(record => `
            Pattern: ${record.get("pattern")}
            Context: ${record.get("context")}
            Success Stories: ${record.get("understanding_moments")}
        `).join("\n")}
        
        Create a warm, encouraging recommendation that:
        1. Acknowledges their current challenge
        2. Suggests the most relevant pattern(s)
        3. Explains why this pattern might help
        4. Includes a practical example of applying the pattern
        Keep it concise but supportive.
    `;

    const messages: Message[] = [new UserMessage(recommendationPrompt)];
    const input = model.createInput(messages);
    input.system = "You are a supportive learning guide who helps people find natural ways of understanding that match their needs.";
    input.maxTokens = 400;
    input.temperature = 0.7;
    
    const output = model.invoke(input);
    return output.content[0].type === "text" ? 
        output.content[0].text!.trim() : 
        "Could not generate recommendation";
}