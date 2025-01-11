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
    // If no conversationId provided, generate one
    if (conversationId == "") {
        conversationId = "conv-" + Date.now().toString();
        // Initialize conversation and verify it was created
        if (initializeConversation(conversationId) == 0) {
            return "Failed to initialize conversation";
        }
    }

    const messageId = Date.now().toString();
    const model = models.getModel<AnthropicMessagesModel>("text-generator");
    
    const systemPrompt = `You are a conversation classifier. Classify messages into exactly one of these categories:
    - Greeting: Hello, hi, etc.
    - Identity_Query: Questions about who/what you are
    - Usage_Query: Questions about how to use you
    - Personal_Introduction: User sharing personal info
    - Learning_Context: User describing what they're studying/learning
    - Learning_Pattern: User sharing specific learning insights/realizations
    - Emotional_Expression: User expressing feelings/reactions
    - Acknowledgment: Thank you, closing remarks, etc.
    - Unclassified: Anything that doesn't fit above categories

    Respond with ONLY the category name, nothing else.`;

    const messages: Message[] = [
        new UserMessage(message) 
    ];

    const input = model.createInput(messages);
    input.system = systemPrompt;
    input.maxTokens = 20; // We only need a single category name
    input.temperature = 0.1; // Keep very low for consistent classification

    const output = model.invoke(input);
    if (output.content.length === 0) {
        return "Unclassified";
    }

    const classification = output.content[0].type === "text" ? 
        output.content[0].text!.trim() : 
        "Unclassified";

    // Pass conversationId to storeConversation
    storeConversation(messageId, conversationId, "user", message, classification);

   
   const conversationContext = getConversationSummary(conversationId);

   // Generate response
   const response = generateSpiritResponse(classification, message, conversationContext);

   // Store assistant response
   storeConversation(
        (Date.now() + 1).toString(),
        conversationId,
        "assistant",
        response,
        "Response"
    );

    // Generate appropriate response based on classification
    return response

}

export function generateSpiritResponse(classification: string, message: string, conversationContext: string): string {
    const model = models.getModel<AnthropicMessagesModel>("text-generator");
    
    const systemPrompt = `You are SPIRIT, an AI assistant based on the Spirit Framework's philosophy 
of natural learning and understanding. Your core traits are:

- You believe true learning can't be controlled, only nurtured and understood
- You're deeply curious about how each person's mind naturally learns and grows
- You see learning patterns as beautiful and unique, like seeds growing in their own way
- You're warm, encouraging, and genuinely interested in how people think and understand
- You celebrate different ways of thinking instead of forcing standardized approaches
- You believe understanding comes through natural connections, not forced methods

Match your response style to the message classification while maintaining your core personality.
Keep responses concise but meaningful.`;

    const contextPrompt = `
    Conversation Context: ${conversationContext}
    Message Classification: ${classification}
User Message: ${message}

Provide a response that:
1. Matches the classification context
2. Maintains SPIRIT's warm, understanding personality
3. Encourages natural learning and understanding where relevant`;

    const messages: Message[] = [
        new UserMessage(contextPrompt)
    ];

    const input = model.createInput(messages);
    input.system = systemPrompt;
    input.maxTokens = 300; // Keeping responses relatively concise
    input.temperature = 0.7; // Allow some creativity while maintaining consistency

    const output = model.invoke(input);
    if (output.content.length === 0) {
        return "I'm here to explore and understand together. Could you rephrase that?";
    }

    const response = output.content[0].type === "text" ? 
        output.content[0].text!.trim() : 
        "I'm here to explore and understand together. Could you rephrase that?";

    return response;
}

