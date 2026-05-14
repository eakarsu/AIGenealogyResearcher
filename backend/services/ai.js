const axios = require('axios');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function callAI(systemPrompt, userMessage) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022';

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set in environment variables');
  }

  try {
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 2000,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3001',
          'X-Title': 'AI Genealogy Researcher',
        },
      }
    );

    const choice = response.data.choices && response.data.choices[0];
    if (!choice) {
      throw new Error('No response from AI model');
    }
    return choice.message.content;
  } catch (err) {
    if (err.response) {
      throw new Error(`OpenRouter API error: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
    }
    throw err;
  }
}

async function analyzeHistoricalRecord(query, record = null) {
  const systemPrompt =
    'You are an expert genealogist specializing in historical records analysis. Analyze the provided historical record information and extract key genealogical details such as names, dates, locations, relationships, and any other relevant information. Provide insights about the historical context and suggest related records to investigate.';
  let message = query;
  if (record) {
    message = `Here is the existing DB record: ${JSON.stringify(record, null, 2)}\n\nUser question: ${query}`;
  }
  return callAI(systemPrompt, message);
}

async function analyzeDNAMatch(matchData, record = null) {
  const systemPrompt =
    'You are a genetic genealogy expert. Analyze the provided DNA match data including shared centimorgans, segments, and any known relationships. Estimate the most likely relationship between the individuals, suggest possible common ancestors, and recommend next steps for confirming the connection.';
  let message = typeof matchData === 'string' ? matchData : JSON.stringify(matchData);
  if (record) {
    message = `Here is the existing DB record: ${JSON.stringify(record, null, 2)}\n\nUser question: ${message}`;
  }
  return callAI(systemPrompt, message);
}

async function searchCensusRecords(query) {
  const systemPrompt =
    'You are a genealogy researcher specializing in census records from the United States and other countries. Help the user understand census data, identify family members, track migration patterns, and interpret occupations, property values, and household compositions recorded in census documents.';
  return callAI(systemPrompt, query);
}

async function analyzeImmigrationRecord(query) {
  const systemPrompt =
    'You are an expert in immigration history and genealogy. Analyze immigration records, ship manifests, naturalization papers, and border crossing records. Help identify immigrant ancestors, their origins, travel routes, and settlement patterns. Provide historical context about immigration waves and policies.';
  return callAI(systemPrompt, query);
}

async function analyzeBirthDeathRecord(query) {
  const systemPrompt =
    'You are a vital records specialist for genealogical research. Analyze birth and death certificates, church baptismal and burial records, and other vital records. Extract key information such as parents\' names, causes of death, witnesses, and any other genealogically significant details.';
  return callAI(systemPrompt, query);
}

async function analyzeMarriageRecord(query) {
  const systemPrompt =
    'You are a genealogy expert specializing in marriage records. Analyze marriage certificates, banns, licenses, and related documents. Identify the spouses, their parents, witnesses, officiant, and location details. Provide historical context about marriage customs and suggest related records to search.';
  return callAI(systemPrompt, query);
}

async function analyzeMilitaryRecord(query) {
  const systemPrompt =
    'You are a military history and genealogy expert. Analyze military service records, pension files, draft registrations, and veterans\' records. Identify the service member\'s unit, rank, dates of service, battles, decorations, and any pension or disability information. Provide historical context about the conflicts involved.';
  return callAI(systemPrompt, query);
}

async function searchNewspaperArchive(query) {
  const systemPrompt =
    'You are a genealogical researcher specializing in historical newspaper archives. Help search for and analyze obituaries, birth announcements, marriage announcements, legal notices, and other newspaper articles that contain genealogical information. Extract names, dates, relationships, and other key details.';
  return callAI(systemPrompt, query);
}

async function analyzeLandRecord(query) {
  const systemPrompt =
    'You are a genealogy expert specializing in land and property records. Analyze deeds, land grants, tax records, homestead applications, and property transfers. Identify property owners, locations, transaction details, and neighboring landowners. Provide context about land distribution patterns and policies.';
  return callAI(systemPrompt, query);
}

async function analyzeChurchRecord(query) {
  const systemPrompt =
    'You are a genealogist specializing in church and religious records. Analyze baptismal records, confirmation records, marriage registers, burial records, and membership rolls from various denominations. Extract names, dates, sponsors/godparents, and family relationships. Provide context about denominational record-keeping practices.';
  return callAI(systemPrompt, query);
}

async function analyzeShipManifest(query) {
  const systemPrompt =
    'You are an expert in historical ship manifests and passenger lists for genealogical research. Analyze passenger arrival records, ship manifests, and emigration lists. Identify passengers, their ages, nationalities, occupations, destinations, and traveling companions. Provide context about shipping routes and immigration patterns.';
  return callAI(systemPrompt, query);
}

async function estimateEthnicity(personData) {
  const systemPrompt =
    'You are a genetic genealogy and ethnicity estimation expert. Based on the provided information about a person (name origins, known ancestry, geographic locations, DNA data if available), provide an estimated ethnic and geographic origin analysis. Discuss historical migration patterns that may be relevant and suggest DNA testing strategies for further clarity. Always note that ethnicity estimates are approximations.';
  const message = typeof personData === 'string' ? personData : JSON.stringify(personData);
  return callAI(systemPrompt, message);
}

async function analyzeNameOrigin(name) {
  const systemPrompt =
    'You are an onomastics expert (study of names) with deep knowledge of genealogy. Analyze the given name for its linguistic origins, historical meaning, geographic distribution, and variations across cultures. Discuss common surname evolution patterns (patronymic, occupational, geographic, descriptive) and suggest regions where this name is most prevalent.';
  return callAI(systemPrompt, name);
}

async function generateTimeline(personData, dbContext = null) {
  const systemPrompt =
    'You are a genealogist who creates detailed life timelines. Based on the provided person data and any associated records, generate a chronological timeline of key life events including birth, education, marriage, children, occupations, residences, military service, immigration, and death. Include historical context for each period. Format the timeline clearly with dates and descriptions.';
  let message = typeof personData === 'string' ? personData : JSON.stringify(personData);
  if (dbContext) {
    message = `Here are the database records found for this person across multiple record types:\n${JSON.stringify(dbContext, null, 2)}\n\nPlease generate a comprehensive timeline: ${message}`;
  }
  return callAI(systemPrompt, message);
}

// Resolve conflicts between contradictory genealogical records
async function resolveConflict(query) {
  const systemPrompt = `You are an expert genealogist resolving conflicts between primary records (census, church, military, immigration, etc.).
Weigh source reliability, transcription error patterns, name variants, and date conventions (e.g. census enumeration vs. actual birth date).
Return STRICT JSON only:
{
  "summary": "...",
  "candidate_resolutions": [
    { "value": "string|date|number", "confidence_pct": 0, "supporting_sources": ["..."], "rationale": "string" }
  ],
  "most_likely_value": "string",
  "follow_up_research": ["..."],
  "transcription_error_risks": ["..."],
  "disclaimer": "AI assists; verify with original images when possible."
}`;
  return callAI(systemPrompt, JSON.stringify(query));
}

// Generate the next-best research roadmap given known ancestors and progress
async function generateRoadmap(query) {
  const systemPrompt = `You are an expert research planner for genealogy. Given a person's known facts and the user's research progress, produce the next 5-10 most efficient research steps.
Return STRICT JSON only:
{
  "summary": "...",
  "next_steps": [
    { "step": "string", "source_type": "census|church|land|military|immigration|newspaper|dna|other", "expected_payoff": "low|medium|high", "estimated_effort": "low|medium|high", "rationale": "string" }
  ],
  "low_hanging_fruit": ["..."],
  "deferred_until_breakthrough": ["..."],
  "tools_or_databases_to_use": ["FamilySearch", "Ancestry", "FindMyPast", "..."],
  "disclaimer": "Suggestions only."
}`;
  return callAI(systemPrompt, JSON.stringify(query));
}

module.exports = {
  analyzeHistoricalRecord,
  analyzeDNAMatch,
  searchCensusRecords,
  analyzeImmigrationRecord,
  analyzeBirthDeathRecord,
  analyzeMarriageRecord,
  analyzeMilitaryRecord,
  searchNewspaperArchive,
  analyzeLandRecord,
  analyzeChurchRecord,
  analyzeShipManifest,
  estimateEthnicity,
  analyzeNameOrigin,
  generateTimeline,
  resolveConflict,
  generateRoadmap,
};
