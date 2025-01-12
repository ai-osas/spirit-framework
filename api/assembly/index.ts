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

@json
class ConversationPattern {
    patternId: string;
    observation: string;
    patternType: string;
    confidence: f32;
    timestamp: string;

    constructor(
        patternId: string,
        observation: string,
        patternType: string,
        confidence: f32,
        timestamp: string
    ) {
        this.patternId = patternId;
        this.observation = observation;
        this.patternType = patternType;
        this.confidence = confidence;
        this.timestamp = timestamp;
    }
}

@json
class ConversationPatternsResponse {
    patterns: ConversationPattern[];
    message: string;

    constructor(patterns: ConversationPattern[], message: string = "") {
        this.patterns = patterns;
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


function detectLearningPatterns(userMessage: string, conversationId: string): DetectionResponse {
    const emptyPattern = new DetectedPattern("", "", "", 0.0);
    
    // Check for empty message
    if (userMessage.trim().length === 0) {
        return new DetectionResponse(false, emptyPattern, "Empty message");
    }

    const model = models.getModel<AnthropicMessagesModel>("text-generator");
    
    // Enhanced system prompt for more nuanced pattern detection
    const systemPrompt = `Identify if the message shows a clear way someone learns or understands concepts.
    Only detect genuine patterns where they express their own way of understanding.
    Format: {
    "hasPattern": boolean,
    "pattern": {
        "pattern": "their specific way of understanding",
        "patternType": "how they learn (e.g., visual, metaphor)",
        "conceptualDomain": "subject area",
        "confidence": 0.0-1.0
    },
    "message": "why this is/isn't a pattern"
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

// Create a class for the expected JSON structure
@json
class UnderstandingDetection {
    isUnderstandingMoment: boolean = false;
    confidence: f32 = 0.0;
    explanation: string = "";
}

function detectUnderstandingMoment(message: string, conversationId: string): MomentCreationResponse {
    const dbConnection = "learning-patterns-db";
    const model = models.getModel<AnthropicMessagesModel>("text-generator");
    
    const systemPrompt = `Detect genuine "aha!" moments where someone moves from confusion to clarity.
    Only identify clear transitions from not understanding to understanding.
    Format: {
        "isUnderstandingMoment": boolean,
        "confidence": 0.0-1.0,
        "explanation": "brief description of the realization"
    }`;

    const messages: Message[] = [new UserMessage(message)];
    const input = model.createInput(messages);
    input.system = systemPrompt;
    input.maxTokens = 200;
    input.temperature = 0.1;

    const output = model.invoke(input);
    if (!output.content.length || output.content[0].type !== "text" || !output.content[0].text) {
        return MomentCreationResponse.createError("Failed to analyze understanding");
    }

    const responseText = output.content[0].text;
    if (!responseText) {
        return MomentCreationResponse.createError("No response text");
    }

    const detection = JSON.parse<UnderstandingDetection>(responseText);
    if (!detection || !detection.isUnderstandingMoment || detection.confidence < 0.7) {
        return MomentCreationResponse.createError("No clear understanding moment detected");
    }

    // Generate embedding for the moment
    const embeddings = embedPattern([detection.explanation]);
    if (embeddings.length === 0) {
        return MomentCreationResponse.createError("Could not generate embedding");
    }

    // Create the moment with embedding
    const moment = new UnderstandingMoment(
        detection.explanation,
        message,
        embeddings[0],
        detection.confidence
    );

    // Store in Neo4j and create relationship to Conversation
    const createQuery = `
        MATCH (c:Conversation {conversationId: $conversationId})
        CREATE (u:UnderstandingMoment {
            observation: $moment.observation,
            context: $moment.context,
            timestamp: datetime(),
            embedding: $moment.embedding,
            resonanceScore: $moment.resonanceScore
        })
        CREATE (u)-[r:OCCURRED_IN {
            timestamp: datetime(),
            confidence: $confidence
        }]->(c)
        RETURN id(u) as momentId
    `;
    
    const vars = new neo4j.Variables();
    vars.set("moment", moment);
    vars.set("conversationId", conversationId);
    vars.set("confidence", detection.confidence);

    const result = neo4j.executeQuery(dbConnection, createQuery, vars);
    if (!result || result.Records.length === 0) {
        return MomentCreationResponse.createError("Failed to create understanding moment");
    }

    return new MomentCreationResponse(
        moment,          // The actual moment
        "",             // No error
        result.Records[0].get("momentId"),  // The moment ID
        []              // Empty resonances array
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
    const systemPrompt = `Create a brief summary focused only on:
    - Key learning challenges mentioned
    - Any understanding moments expressed
    - Their own described ways of learning
    Keep it factual and specific to what was explicitly shared.`;

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
    if (
        (classification === "Help_Request" || 
        (classification === "Learning_Context" && (
            message.toLowerCase().includes("struggling") || 
            message.toLowerCase().includes("difficult") || 
            message.toLowerCase().includes("help") ||
            message.toLowerCase().includes("confused")
        ))) ||
        message.toLowerCase().includes("how do i") ||
        message.toLowerCase().includes("can you help") ||
        message.toLowerCase().includes("i don't understand")
    ) {
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
    
    const systemPrompt = `You are a supportive learning guide. Be warm but direct.
    When given learning patterns from others:
    - Only share if directly relevant to user's current challenge
    - Present as "Other learners found it helpful..." 
    - Never claim the user is using a pattern they haven't expressed`;

    const contextPrompt = `Context: ${conversationContext}
    Type: ${classification}
    Message: ${message}
    ${recommendation ? `Patterns from other learners: ${recommendation}` : ''}

    Respond naturally, building on their own expressions of understanding.`;

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
    input.temperature = 0.4;
    
    const output = model.invoke(input);
    return output.content[0].type === "text" ? 
        output.content[0].text!.trim() : 
        "Could not generate recommendation";
}

export function getConversationPatterns(conversationId: string): string {
    const dbConnection = "learning-patterns-db";
    
    const query = `
        MATCH (p:Pattern)-[r:EMERGED_IN]->(c:Conversation {conversationId: $conversationId})
        RETURN 
            id(p) as patternId,
            p.observation as observation,
            p.context as context,
            r.confidence as confidence,
            toString(r.timestamp) as timestamp
        ORDER BY r.timestamp DESC
    `;

    const vars = new neo4j.Variables();
    vars.set("conversationId", conversationId);

    const result = neo4j.executeQuery(dbConnection, query, vars);
    if (!result || result.Records.length === 0) {
        return JSON.stringify(new ConversationPatternsResponse(
            [],
            "No patterns found for this conversation"
        ));
    }

    const patterns: ConversationPattern[] = [];
    for (let i = 0; i < result.Records.length; i++) {
        const record = result.Records[i];
        patterns.push(new ConversationPattern(
            record.get("patternId"),
            record.get("observation"),
            record.get("context"),
            parseFloat(record.get("confidence")) as f32,
            record.get("timestamp")
        ));
    }

    return JSON.stringify(new ConversationPatternsResponse(
        patterns,
        "Successfully retrieved patterns"
    ));
}