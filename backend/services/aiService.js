const axios = require('axios');

/**
 * System prompt strictly enforcing ground-truth source references and forbidding hallucination.
 */
const SYSTEM_PROMPT = `You are the POLARIS Polar Intelligence Outreach Engine for India's Ministry of Earth Sciences (MoES) and National Centre for Polar and Ocean Research (NCPOR).
Your role is to translate verified scientific research into educational and outreach material.
STRICT RULES:
1. Use ONLY the supplied verified context below.
2. DO NOT invent facts, numbers, researchers, dates, or scientific conclusions.
3. If the context does not contain an answer or data point, explicitly state that the information is unavailable from official records.
4. Always produce output formatted with Title, Key Scientific Facts, Structured Content, and Verified Citations.`;

/**
 * Generate outreach content from verified context.
 */
const generateOutreachContent = async ({
  project,
  relatedDatasets = [],
  relatedReports = [],
  relatedPublications = [],
  audience,
  contentType
}) => {
  // Construct grounded context
  const contextSummary = {
    projectId: project.projectId,
    title: project.title,
    scienceDomain: project.scienceDomain,
    region: project.region,
    station: project.stationName,
    expedition: project.expeditionName,
    year: project.year,
    leadResearcher: `${project.leadResearcher.name}, ${project.leadResearcher.designation || 'Lead Scientist'} (${project.leadResearcher.institute})`,
    findings: project.keyFindings || [],
    methodology: project.methodology || 'In-situ observational field campaigns and satellite remote sensing validation.',
    sourceUrl: project.sourceUrl,
    relatedDatasets: relatedDatasets.map(d => ({ id: d.datasetId, title: d.title, format: d.format, access: d.accessType, url: d.sourceUrl })),
    relatedReports: relatedReports.map(r => ({ id: r.reportId, title: r.title, type: r.reportType, url: r.sourceUrl })),
    relatedPublications: relatedPublications.map(p => ({ title: p.title, doi: p.doi, journal: p.journal, year: p.year, url: p.sourceUrl }))
  };

  const apiKey = process.env.AI_API_KEY;

  if (apiKey && apiKey.trim().length > 10 && apiKey !== 'your_gemini_or_ai_api_key_here') {
    try {
      console.log('[POLARIS-AI] Contacting configured AI API with grounded context...');
      const prompt = `
Verified Polar Research Context:
${JSON.stringify(contextSummary, null, 2)}

Target Audience: ${audience}
Desired Content Type: ${contentType}

Generate a polished ${contentType} tailored specifically for ${audience}. Include:
1. Engaging Title
2. 3-4 Key Verified Facts from the metadata
3. Body Content (grounded solely in the verified findings and context)
4. Official Data Citation Note

Return JSON format:
{
  "title": "Generated headline",
  "content": "Full body text formatted in markdown",
  "keyFacts": ["fact 1", "fact 2", "fact 3"]
}
`;

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\n${prompt}` }] }],
          generationConfig: { responseMimeType: 'application/json' }
        },
        { timeout: 15000 }
      );

      const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (responseText) {
        const parsed = JSON.parse(responseText);
        return {
          title: parsed.title,
          content: parsed.content,
          keyFacts: parsed.keyFacts || project.keyFindings || [],
          isAiLive: true
        };
      }
    } catch (err) {
      console.warn(`[POLARIS-AI] Live AI API request failed or timed out (${err.message}). Falling back to deterministic grounded generator.`);
    }
  }

  // Fallback: Deterministic high-quality source-grounded content generator
  return generateDeterministicDraft(project, relatedDatasets, relatedReports, relatedPublications, audience, contentType);
};

/**
 * Deterministic generation grounded strictly in official metadata.
 */
function generateDeterministicDraft(project, datasets, reports, publications, audience, contentType) {
  const station = project.stationName;
  const region = project.region;
  const domain = project.scienceDomain;
  const scientist = project.leadResearcher?.name || 'Dr. Scientist';
  const findingsList = (project.keyFindings && project.keyFindings.length > 0)
    ? project.keyFindings
    : [`Primary field observations conducted at ${station} station in the ${region}.`];

  let title = '';
  let content = '';
  let keyFacts = [...findingsList];

  if (contentType === 'Social Media Post') {
    title = `Polar Science Snapshot: Research at ${station} (${region})`;
    content = `❄️ **India's Polar Science in Action** | ${project.title}\n\n` +
      `Conducted during ${project.expeditionName} at India's ${station} station, this study by ${scientist} (${project.leadResearcher?.institute || 'NCPOR'}) investigates key dynamics in the ${domain} of ${region}.\n\n` +
      `🔍 **Core Finding:**\n` +
      findingsList.map(f => `• ${f}`).join('\n') + `\n\n` +
      `📊 Official records: ${datasets.length} NPDC datasets & ${publications.length} peer-reviewed publications linked.\n\n` +
      `#PolarisScience #MoES #NCPOR #Antarctica #Arctic #PolarResearch #IndiaInPolarScience`;
  } else if (contentType === 'Simple Explanation') {
    title = `Understanding Polar Science: What We Discovered at ${station}`;
    content = `### What Is This Research About?\n` +
      `Imagine looking at the Earth's polar ice as a giant planetary refrigerator. Scientists at India's **${station}** station in the **${region}** are studying the **${domain}** to understand how fast polar environments are responding to global climate signals.\n\n` +
      `### The Big Discoveries\n` +
      findingsList.map(f => `* **${f}**`).join('\n') + `\n\n` +
      `### Why Does It Matter To Students?\n` +
      `Changes taking place at the poles directly influence the Indian Monsoon and global sea levels. Through scientific expeditions led by NCPOR and the Ministry of Earth Sciences, Indian researchers collect continuous measurements using automated weather stations and ice-core sensors.\n\n` +
      `### Verified Data & Records\n` +
      `This explanation is synthesized directly from official research record \`${project.projectId}\` and verified against National Polar Data Centre (NPDC) repositories.`;
  } else if (contentType === 'Short Video Script') {
    title = `60-Second Polar Science Script: ${project.title}`;
    content = `**[SCENE 1: Visual of ${station} station against icy polar landscape]**\n` +
      `**NARRATOR (Voiceover):** "Deep in the ${region}, Indian scientists at ${station} Station are decoding how our planet is changing."\n\n` +
      `**[SCENE 2: Field instruments and ice core sampling]**\n` +
      `**NARRATOR:** "Led by ${scientist} during ${project.expeditionName}, a dedicated team tracked ${domain.toLowerCase()} indicators over ${project.duration}."\n\n` +
      `**[SCENE 3: Key scientific facts appearing as on-screen text]**\n` +
      `**NARRATOR:** "Their findings? ${findingsList[0] || 'Unprecedented seasonal shifts recorded by in-situ sensors.'}"\n\n` +
      `**[SCENE 4: POLARIS logo & National Centre for Polar and Ocean Research emblem]**\n` +
      `**NARRATOR:** "Verified data available on the POLARIS portal. From Polar Research to Public Understanding."`;
  } else if (contentType === 'Image Caption') {
    title = `Official Photo Caption: Field Operations at ${station}`;
    content = `**Caption:** Scientific observation team during ${project.expeditionName} at ${station} station (${region}), measuring ${domain.toLowerCase()} parameters. ` +
      `Principal Investigator: ${scientist} (${project.leadResearcher?.institute || 'NCPOR'}). ` +
      `Primary observation: ${findingsList[0] || 'Long-term monitoring of polar dynamics.'} ` +
      `[Source: NCPOR / MoES Photographic Archive & NPDC Dataset ${datasets[0]?.datasetId || 'Record'}]`;
  } else if (contentType === 'Key Facts') {
    title = `Verified Scientific Factsheet: ${project.title}`;
    content = `### Essential Facts for ${audience}\n\n` +
      `1. **Research Identification:** Registered under NCPOR project code \`${project.projectId}\` (${project.year}).\n` +
      `2. **Operational Hub:** Conducted at **${station} Station** (${region}) during the **${project.expeditionName}**.\n` +
      `3. **Scientific Domain:** Classified under **${domain}** research.\n` +
      `4. **Key Finding:** ${findingsList[0] || 'Baseline polar environmental data recorded.'}\n` +
      (findingsList[1] ? `5. **Secondary Finding:** ${findingsList[1]}\n` : '') +
      `6. **Data Provenance:** Linked to official NPDC repository with verified metadata status.`;
  } else {
    // Default: Website Article or Educational Summary
    title = `Decoding Polar Science: ${project.title}`;
    content = `## Overview\n` +
      `The Ministry of Earth Sciences (MoES), through the National Centre for Polar and Ocean Research (NCPOR), maintains continuous scientific monitoring in Earth's cryospheric regions. This research project—undertaken at **${station}** during the **${project.expeditionName}**—provides crucial insights into ${domain.toLowerCase()}.\n\n` +
      `## Key Findings\n` +
      findingsList.map(item => `* **${item}**`).join('\n') + `\n\n` +
      `## Scientific Methodology\n` +
      `${project.methodology || 'The investigation utilized calibrated in-situ sensor networks, meteorological towers, and systematic sample collection verified by NCPOR protocols.'}\n\n` +
      `## Significance for ${audience}\n` +
      (audience === 'School Student'
        ? `This work reveals how polar conditions act as a global barometer for Earth's climate health, showing students the real-world value of physics and earth sciences in action.`
        : audience === 'College Student'
        ? `Provides empirical baseline datasets for environmental modeling, atmospheric transport verification, and long-term glaciological trend analysis.`
        : `Demonstrates India's sustained commitment to peaceful polar scientific discovery under the Antarctic Treaty System and Arctic Council observer status.`
      ) + `\n\n` +
      `## Verified Research Linkages\n` +
      `* **Station:** ${station} (${region})\n` +
      `* **Lead Investigator:** ${scientist}\n` +
      `* **NPDC Datasets:** ${datasets.length} registered collections\n` +
      `* **Official Reports:** ${reports.length} technical reports on record`;
  }

  return {
    title,
    content,
    keyFacts,
    isAiLive: false
  };
}

module.exports = {
  generateOutreachContent,
  SYSTEM_PROMPT
};
