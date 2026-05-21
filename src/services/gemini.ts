import { GoogleGenAI, Type } from "@google/genai";

export type VocalIntensity = 'auto' | 'soft' | 'normal' | 'powerful' | 'operatic' | 'aggressive' | 'shouting_mc' | 'dynamic';
export type AudioProduction = 'auto' | 'standard' | 'studio' | 'cinematic' | 'live' | 'festival';
export type VocalExtras = 'auto' | 'none' | 'choir' | 'harmonies' | 'gang_vocals' | 'intimate' | 'vocoder' | 'autotune' | 'megaphone' | 'humanized';
export type VocalGender = 'auto' | 'male' | 'female' | 'both';
export type StructureType = 'auto' | 'standard' | 'edm' | 'rap' | 'classical' | 'ambient';
export type VocalDensity = 'auto' | 'dense' | 'sparse' | 'chops';
export type Tempo = 'auto' | 'slow' | 'mid' | 'fast' | 'extreme';
export type EnergyLevel = 'auto' | 'intimate' | 'standard' | 'stadium' | 'cinematic';
export type Mood = 'auto' | 'dark' | 'melancholic' | 'uplifting' | 'aggressive' | 'epic' | 'romantic';

export async function recommendSettings(request: string): Promise<{
  vocalIntensity: VocalIntensity;
  audioProduction: AudioProduction;
  vocalExtras: VocalExtras;
  vocalGender: VocalGender;
  isInstrumental: boolean;
  language: string;
  structureType: StructureType;
  vocalDensity: VocalDensity;
  studioGear: string;
  tempo: Tempo;
  energyLevel: EnergyLevel;
  mood: Mood;
}> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Please check your environment variables.");
  }
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await Promise.race([
      ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze the following song request and recommend the best settings for Vocal Intensity, Audio Production, Vocal Extras, Vocal Gender, Instrumental status, Language, and Song Structure.
        
        STEP 1: Identify the CORE GENRE and MOOD.
        STEP 2: If the request contains lyrics or a band name, IDENTIFY THE ORIGINAL ARTIST/BAND and their "SIGNATURE SOUND".
        STEP 3: Determine the TECHNICAL REQUIREMENTS (BPM, Key, Production Style) based on the identified artist or genre.
        STEP 4: Deconstruct the EXACT VOCAL PROFILE (timbre, range, specific effects like 'slapback delay', 'heavy distortion', 'telephone filter').
        STEP 5: Select the best matching settings from the available options.
        STEP 6: Recommend specific, ICONIC STUDIO GEAR and INSTRUMENTS (e.g., "Gibson SG through a Vox AC30", "Roland TR-808", "Shure 520DX Green Bullet") that define that artist's sound.
        STEP 7: If the artist is known for specific structural elements (e.g., "long atmospheric intros", "sudden tempo changes"), include these in the structure recommendation.

  Request: "${request}"`,
        config: {
          systemInstruction: `You are a World-Class Music Historian, Gear Expert, and Executive Producer. Your knowledge of musical equipment, vocal techniques, and production history is exhaustive.

  Your task is to analyze any request and provide the most technically accurate settings to replicate a specific artist's "DNA" in Suno AI.

  If a band or artist is mentioned (or implied by lyrics):
  1. Access your deep knowledge of their discography and studio setup.
  2. Identify their signature instruments (e.g., "The Edge's dotted-eighth delay", "Kurt Cobain's Small Clone chorus"). For rappers (like Rytmus, Kali), identify their beat style (e.g., "heavy 808s, trap hi-hats, piano melodies"). For classic pop/schlager (like Karel Gott), identify the orchestration (e.g., "big band brass, lush string section, grand piano").
  3. Recommend specific gear in the 'studioGear' field.
  4. Adjust 'vocalIntensity' and 'vocalExtras' to match the singer's unique delivery (e.g., 'autotune' for melodic rap, 'aggressive' for hardcore rap, 'operatic' or 'powerful' for classic bel canto singers).
  5. For atmospheric or ambient artists (e.g., Enya, Erutan, Sigur Rós), you MUST recommend 'vocalDensity: sparse' and 'structureType: ambient'. Their music is defined by textures and humming, not long lyrical verses.
          
  Available Vocal Intensity: 'auto', 'soft', 'normal', 'powerful', 'operatic', 'aggressive', 'shouting_mc', 'dynamic'
  Available Audio Production: 'auto', 'standard', 'studio', 'cinematic', 'live', 'festival'
  Available Vocal Extras: 'auto', 'none', 'choir', 'harmonies', 'gang_vocals', 'intimate', 'vocoder', 'autotune', 'megaphone', 'humanized'
  Available Vocal Gender: 'auto', 'male', 'female', 'both'
  Available Structure Types: 'auto', 'standard' (pop/rock), 'edm' (build-ups/drops), 'rap' (verses/hooks), 'classical' (movements/sonatas), 'ambient' (flowing/evolving)
  Available Vocal Density: 'auto', 'dense' (lots of lyrics), 'sparse' (mostly instrumental, occasional phrases), 'chops' (vocal samples only)

  CRITICAL: For 'shouting_mc', use it for high-energy rave/dancefloor MCs (like Scooter) who use rhythmic speaking/shouting rather than traditional singing or screaming. For 'operatic', use it for clean, powerful classical/symphonic vocals (like Nightwish).
  For 'studioGear', be as specific as possible (e.g., "Neumann U87, SSL Console, Moog One").
  LANGUAGE RULES: 
  1. If a specific band/artist is identified (e.g., Scooter, Rammstein, Traktor), you MUST set the language to the language they typically sing in (e.g., 'English' for Scooter, 'German' for Rammstein, 'Czech' for Traktor), REGARDLESS of what language the user used to write the prompt.
  2. If no artist is identified, default to the language the user wrote the prompt in (e.g., if the prompt is in Czech, return 'Czech').
  3. If the user explicitly requests a language (e.g., "in Spanish"), honor that request.

  Return a JSON object with the recommended settings.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              vocalIntensity: {
                type: Type.STRING,
                description: "Recommended vocal intensity",
              },
              audioProduction: {
                type: Type.STRING,
                description: "Recommended audio production style",
              },
              vocalExtras: {
                type: Type.STRING,
                description: "Recommended vocal extras",
              },
              vocalGender: {
                type: Type.STRING,
                description: "Recommended vocal gender",
              },
              isInstrumental: {
                type: Type.BOOLEAN,
                description: "Whether the track should be instrumental (no vocals)",
              },
              language: {
                type: Type.STRING,
                description: "The detected or requested language (e.g., 'Czech', 'English', 'auto')",
              },
              structureType: {
                type: Type.STRING,
                description: "The recommended song structure type",
              },
              vocalDensity: {
                type: Type.STRING,
                description: "Recommended vocal density (how much singing there is)",
              },
              tempo: {
                type: Type.STRING,
                description: "Recommended tempo/speed of the song based on the requested vibe",
              },
              energyLevel: {
                type: Type.STRING,
                description: "Recommended overall energy and scale (e.g., intimate vs stadium)",
              },
              mood: {
                type: Type.STRING,
                description: "Recommended emotional mood of the song",
              },
              studioGear: {
                type: Type.STRING,
                description: "Recommended specific studio gear or instruments (e.g., 'Fender Stratocaster, Vintage Tube Amp')",
              },
            },
            required: ["vocalIntensity", "audioProduction", "vocalExtras", "vocalGender", "isInstrumental", "language", "structureType", "vocalDensity", "tempo", "energyLevel", "mood", "studioGear"],
          },
        },
      }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Analýza trvala příliš dlouho. Zkuste to prosím znovu.")), 30000)
      )
    ]);

    if (!response.text) {
      throw new Error("Žádná odpověď od AI.");
    }

    return JSON.parse(response.text.trim());
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("429") || error.status === "RESOURCE_EXHAUSTED") {
      throw new Error("Dosáhli jste limitu požadavků (Quota Exceeded). Zkuste to prosím za chvíli nebo použijte jiný model.");
    }
    throw new Error(error.message || "Nepodařilo se doporučit nastavení.");
  }
}

export async function generateAlbumArt(title: string, style: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set.");
  }
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await Promise.race([
      ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: `Create a professional, high-quality album cover art for a song titled "${title}". Musical style/vibe: ${style}. The artwork should be artistic, cinematic, and iconic. No text on the image except maybe the title if it looks professional. High resolution, professional lighting, artistic composition.`,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Generování obalu trvalo příliš dlouho.")), 30000)
      )
    ]);

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned from the model.");
  } catch (error: any) {
    console.error("Album Art Generation Error:", error);
    if (error.message?.includes("429") || error.status === "RESOURCE_EXHAUSTED") {
      throw new Error("Limit požadavků pro obrázky vyčerpán. Zkuste to za chvíli.");
    }
    throw new Error(`Nepodařilo se vygenerovat obal alba: ${error.message || 'Neznámá chyba'}`);
  }
}

export async function generateSunoPrompt(
  request: string, 
  isInstrumental: boolean, 
  vocalIntensity: VocalIntensity = 'auto',
  audioProduction: AudioProduction = 'auto',
  vocalExtras: VocalExtras = 'auto',
  vocalGender: VocalGender = 'auto',
  language: string = 'auto',
  structureType: StructureType = 'auto',
  vocalDensity: VocalDensity = 'auto',
  tempo: Tempo = 'auto',
  energyLevel: EnergyLevel = 'auto',
  mood: Mood = 'auto',
  studioGear: string = 'auto',
  mode: 'generate' | 'refine' = 'generate'
) {
  const instrumentalInstruction = isInstrumental 
    ? "\n\nCRITICAL REQUIREMENT: The user requested an INSTRUMENTAL track. Do NOT write any sung lyrics. The lyricsBox MUST contain ONLY structural and instrumental tags (e.g., [Intro], [Instrumental Verse], [Guitar Solo], [Heavy Riff], [Beat Drop], [Outro], [End]). Ensure the styleBox explicitly includes 'Instrumental'."
    : "\n\nCRITICAL REQUIREMENT: The user requested a track WITH VOCALS. Write full lyrics and include vocal direction tags alongside structural tags.";

  const intensityMap: Record<string, string> = {
    soft: 'soft breathy vocals, gentle singing, whisper, delicate, intimate, close-mic recording, low dynamic range. Do not use belting or shouting.',
    normal: 'Standard singing voice, balanced dynamics, natural delivery.',
    powerful: 'powerful belting, strong chest voice, soaring vocals, emotional delivery, high energy projection.',
    operatic: 'operatic female vocals, dramatic soprano, clear head voice, vibrato, symphonic metal style, high dynamic range, large hall reverb. Clean, classical, and majestic.',
    aggressive: 'aggressive delivery, high energy. For Neue Deutsche Härte/Rammstein, keep the vocals clean operatic baritone but the instrumental and delivery aggressive: "deep clean operatic baritone, aggressive but catchy, NO fry screams, NO guttural growls".',
    shouting_mc: 'high energy rhythmic spoken-word delivery, commanding MC speech, rhythmic shouting (speaking style), powerful rave MC, hype man vocals, energetic dancefloor MC, crisp high-end, commanding presence, heavy megaphone grit, distorted radio filter, lo-fi vocal processing, clear but powerful rhythmic delivery, NO screaming, NO singing.',
    dynamic: 'dynamic vocal range, soft breathy verses building to powerful soaring choruses, clean vocals only, wide dynamic range, expressive delivery, NO screaming. Use structural tags like [Soft Intimate Verse] and [Explosive Powerful Chorus].'
  };

  const intensityInstruction = vocalIntensity !== 'auto' && !isInstrumental && intensityMap[vocalIntensity]
    ? `\n\nCRITICAL VOCAL INTENSITY: The user requested a '${vocalIntensity}' vocal style conceptually. Guidelines for this style: ${intensityMap[vocalIntensity]}. IMPORTANT: You MUST adapt this intensity to the artist's DNA and genre! Do NOT blindly paste generic aggressive tags if it ruins a clean vocal style.`
    : "";

  const genderMap: Record<string, string> = {
    male: 'male vocals, male singer, deep voice',
    female: 'female vocals, female singer, high voice',
    both: 'male and female duet, alternating vocals, mixed choir'
  };

  const genderInstruction = vocalGender !== 'auto' && !isInstrumental && genderMap[vocalGender]
    ? `\n\nCRITICAL VOCAL GENDER: The user set gender to '${vocalGender}'. Enforce this using: ${genderMap[vocalGender]}`
    : "";

  const productionMap: Record<string, string> = {
    studio: 'high-end studio production, 24-bit lossless, professional mastering, pristine audio quality, zero crowd noise',
    cinematic: 'Dolby Atmos, cinematic mix, massive soundstage, epic reverb, thunderous low-end, 24-bit lossless',
    live: 'live performance, indoor arena acoustics, raw live energy, dynamic soundboard mix, cheering crowd, live concert ambiance',
    festival: 'massive outdoor festival, open-air acoustics, gigantic PA system, massive crowd noise, stadium live performance, thunderous live bass'
  };

  const productionInstruction = audioProduction !== 'standard' && audioProduction !== 'auto' && productionMap[audioProduction]
    ? `\n\nAUDIO PRODUCTION: The user set production to '${audioProduction}'. Use these tags: ${productionMap[audioProduction]}`
    : "";

  const extrasMap: Record<string, string> = {
    choir: 'Add "epic choir backing, massive vocal harmonies, choral arrangement" to Style. Use [Choir] or [Epic Choir] in lyrics.',
    harmonies: 'Add "vocal harmonies, layered vocals, double tracked vocals" to Style. Use [Harmonies] in lyrics.',
    gang_vocals: 'Add "aggressive gang vocals, group shouts, rowdy pub backing vocals, forceful chants" to Style. Use [Gang Vocals] or [Group Shout] in lyrics.',
    intimate: 'Add "close-mic vocals, audible breaths, ASMR-like, intimate vocal delivery, human nuances, delicate phrasing" to Style. Use [Breath], [Sigh], [Whisper], [Vocal Fry] in the lyricsBox between lines.',
    vocoder: 'Add "robotic vocoder, Daft Punk style vocals, synthesized voice" to Style. Use [Vocoder] in lyrics.',
    autotune: 'Add "heavy autotune, modern trap vocals, pitch corrected, melodic rap" to Style. Use [Autotune] in lyrics.',
    megaphone: 'Add "heavy megaphone effect, distorted radio filter, lo-fi vocals, aggressive telephone voice, gritty vocal processing" to Style. Use [Megaphone] or [Radio Filter] in lyrics.',
    humanized: 'Add "human nuances, audible breaths, vocal fry, emotional delivery, realistic phrasing" to Style. Use [Breath], [Sigh], [Vocal Fry], [Voice Crack] naturally between lines in the lyricsBox.'
  };

  const vocalExtrasInstruction = vocalExtras !== 'none' && vocalExtras !== 'auto' && !isInstrumental && extrasMap[vocalExtras]
    ? `\n\nVOCAL EXTRAS: The user set extras to '${vocalExtras}'. Enforce this: ${extrasMap[vocalExtras]}`
    : "";

  const languageInstruction = language !== 'auto' && language.trim() !== '' ? `
\n\nCRITICAL LANGUAGE: The user requested '${language}'. Write lyrics in this language and add "${language} vocals" to Style box.
` : "";

  const structureMap: Record<string, string> = {
    edm: 'Use tags like [Intro], [Build-up], [Drop], [Bass Solo], [Breakdown], [Outro]. Less focus on traditional verses.',
    rap: 'Use tags like [Intro], [Hook], [Verse 1], [Hook], [Verse 2], [Bridge], [Outro]. Focus on rhythm and flow.',
    classical: 'Use tags like [Movement I], [Adagio], [Crescendo], [Forte], [Finale]. (Usually instrumental).',
    ambient: 'Use tags like [Atmospheric Intro], [Evolving Soundscape], [Drone], [Fade Out], [Ethereal Pad], [Layered Harmonies].'
  };

  const structureInstruction = structureType !== 'standard' && structureType !== 'auto' && structureMap[structureType]
    ? `\n\nSONG STRUCTURE: The user set structure to '${structureType}'. Enforce this: ${structureMap[structureType]}`
    : "";

  const gearInstruction = studioGear !== 'auto' && studioGear.trim() !== '' ? `
\n\nSTUDIO GEAR: The user requested '${studioGear}'. Incorporate into Style box (e.g., "recorded with ${studioGear}") and describe sound characteristics.
` : `\n\nSTUDIO GEAR: Automatically deduce and list the exact high-end studio gear that would be used to record this genre (e.g., "Manley Reference Gold Mic, SSL 4000 G Console, Neve 1073 Preamp, Gibson Hummingbird"). Include this in the Style Box. (WARNING: For melodic hard rock/Czech rock like Traktor or Kabát, DO NOT list extreme metal amps like Mesa Boogie or Peavey 5150 as they trigger death metal vocals in Suno. Stick to Marshall JCM800. For Traktor specifically, include orchestral synthesizers like Roland Fantom or Korg Kronos along with traditional rock gear).`;

  const densityMap: Record<string, string> = {
    dense: 'The song should be packed with lyrics. Long verses, continuous singing.',
    sparse: 'MOSTLY INSTRUMENTAL with occasional vocal phrases or humming. Use tags like [Atmospheric Build-up], [Soft Humming], [Ethereal Whisper], [Wordless Choir]. Keep text lines extremely short (1-4 words). Do NOT write full verses.',
    chops: 'NO traditional singing. Only use [Vocal Chops], [Wordless Melodies], [Vocal Textures], or [Chants].'
  };

  const densityInstruction = vocalDensity !== 'auto' && !isInstrumental && densityMap[vocalDensity]
    ? `\n\nVOCAL DENSITY: The user set density to '${vocalDensity}'. Enforce this: ${densityMap[vocalDensity]}`
    : "";

  const tempoMap: Record<string, string> = {
    slow: 'slow tempo, emotional ballad, doom metal pacing, slow march, 60-90 BPM. Use long atmospheric intros and drawn-out notes.',
    mid: 'mid-tempo, marching rhythm, driving groove, 90-120 BPM. Steady and powerful.',
    fast: 'fast tempo, high energy, double-kick drums, upbeat, 140-180 BPM. Fast driving delivery.',
    extreme: 'extreme tempo, blast beats, speed metal, hardcore punk, 180+ BPM. Relentless speed.'
  };

  const tempoInstruction = tempo !== 'auto' && tempoMap[tempo]
    ? `\n\nCRITICAL TEMPO: The user explicitly requested a '${tempo}' tempo. Enforce this: ${tempoMap[tempo]}`
    : `\n\nCRITICAL TEMPO: Automatically deduce the perfect BPM (e.g., "128 BPM") and musical Key (e.g., "Key of G# Minor") for this genre and include it in the Style Box.`;

  const energyMap: Record<string, string> = {
    intimate: 'intimate scale, unplugged, close-mic, minimalist arrangement, playing in a small room, acoustic vibe',
    standard: 'standard band arrangement, balanced energy, studio recording',
    stadium: 'stadium rock, arena sound, massive crowd energy, huge reverb, anthemic scale, larger than life',
    cinematic: 'cinematic scale, epic orchestral backing, Hans Zimmer style, earth-shattering bass, massive wall of sound'
  };

  const energyInstruction = energyLevel !== 'auto' && energyMap[energyLevel]
    ? `\n\nCRITICAL ENERGY/SCALE: The user requested a '${energyLevel}' scale. Enforce this: ${energyMap[energyLevel]}`
    : "";

  const moodMap: Record<string, string> = {
    dark: 'dark mood, ominous, minor key, brooding, mysterious, gothic, haunting',
    melancholic: 'melancholic, sad, emotional, tearjerker, nostalgic, longing, heartbreaking',
    uplifting: 'uplifting, happy, major key, triumphant, energetic, positive vibe, joyful',
    aggressive: 'aggressive, angry, hostile, fierce, relentless, hard-hitting, brutal',
    epic: 'epic, heroic, triumphant, glorious, legendary, mythical, awe-inspiring',
    romantic: 'romantic, passionate, sensual, loving, tender, intimate'
  };

  const moodInstruction = mood !== 'auto' && moodMap[mood]
    ? `\n\nCRITICAL MOOD: The user requested a '${mood}' mood. Enforce this emotional tone: ${moodMap[mood]}`
    : "";

  const referenceTrackInstruction = `\n\nCRITICAL REFERENCE TRACK REPLICATION:
If the user prompt mentions a specific existing song (e.g., "Enrique Iglesias - Bailando", "Nightwish - Nemo"), you MUST act as a musical analyst and replicate its exact vibe, structure, and vocal arrangement:
1. STRUCTURE: Mimic the exact song structure (e.g., if the original has a long acoustic intro, then a verse, then a rap feature, your tags must reflect this: [Acoustic Intro], [Verse 1: Smooth Male], [Rap Feature], etc.).
2. VOCALS: Describe the vocalists exactly as they sound in the original (e.g., "smooth breathy latin male vocals", "energetic reggaeton group shouts"). If there are multiple singers (features), use tags to switch between them (e.g., [Verse 2: Different Male Voice], [Chorus: Group Vocals]).
3. INSTRUMENTATION: Use the exact instruments that define the original track (e.g., "flamenco guitar, reggaeton beat, brass stabs").
Make it as close to a 1:1 stylistic clone as possible without copying the actual copyrighted lyrics.`;

  const qualityInstruction = `\n\nCRITICAL AUDIO QUALITY & MASTERING (ANTI-AI SOUND):
To prevent the song from sounding like a generic AI generation, you MUST dynamically adapt the mastering and mixing tags to perfectly match the requested artist's or genre's real-world production style. 
You MUST output a highly technical, comma-separated list of audiophile terms in the Style Box. ` + (audioProduction === 'auto' || audioProduction === 'standard' ? `
ALWAYS include terms like: "crystal clear vocals, wide stereo imaging, high-end studio production, professional mastering, 24-bit lossless, excellent instrument separation, distinct frequencies, zero AI artifacts".
` : "") + `Examples of genre-specific additions:
- Symphonic/Melodic Metal: "pristine symphonic mix, clear instrument separation, wide dynamic range, balanced EQ, distinct vocals".
- Industrial/Hardcore: "massive wall of sound, heavy analog saturation, dense industrial mix, aggressive compression, thunderous low-end".
- Classic Rock/Punk: "warm analog overdrive, punchy live-room drums, distinct bassline, tight rhythm section, precise instrument separation, crystal clear mix, dynamic rock mix, authentic tube amp saturation, no muddiness".
- EDM/Trance: "club-ready mastering, heavy sidechain compression, massive synth supersaws, deep sub-bass, ultra-wide stereo imaging".
- Latin Pop (like Enrique Iglesias): "husky male tenor, nasal romantic tone, breathy passionate bedroom voice, slight pop autotune, vocal fry".
- Lo-Fi/Chillhop: "vinyl crackle, tape flutter, muffled EQ, SP-404 compression, relaxed sleepy groove, dusty vintage sound".
- Pop/Acoustic: "crystal clear vocals, uncompressed, intimate room acoustics, wide stereo imaging".`;

  const varietyInstruction = `\n\nCRITICAL VARIETY & HUMAN SONGWRITING INSTRUCTION: 
To ensure the user gets a unique, organic-sounding song every time rather than a generic AI formula, here is a random seed: ${Math.random()}. 
Even if the user's request is simple or identical to a previous one, you MUST generate completely NEW content composed like a REAL MUSICIAN.

1. ORGANIC SONG STRUCTURES (ALL GENRES): DO NOT just output standard [Intro] -> [Verse 1] -> [Chorus] -> [Verse 2] -> [Chorus] -> [Outro]. 
   Real songs have nuance! Sometimes they start with the Chorus. Sometimes they have a long 16-bar [Atmospheric Intro] before the beat drops. Sometimes there's a [Pre-Chorus] that slows down, or a [Bridge] that completely changes the key.
   Inject unexpected, genre-appropriate musical moments (e.g., [Bass Break], [Acapella Interlude], [Guitar Feedback], [Sudden Tempo Drop], [Drum Solo]).

2. FOR SONGS WITH LYRICS: DO NOT reuse the same lyrical tropes. Vary the theme, perspective, and phrasing. Avoid repetitive robotic rhyming dictionaries. Write lyrics the way a human artist would—sometimes poetic, sometimes raw, using slang if appropriate.

3. FOR INSTRUMENTAL / EDM TRACKS: You must heavily vary the musical arrangement. Do NOT just output standard [Build-up] -> [Drop] every time. Introduce unexpected structural tags like [Emotional Piano Breakdown], [Sudden Silence], [Acappella Choir Intro], [Arpeggiator Solo], [Heavy Syncopated Bass Drop]. Vary the lead instruments explicitly in the styleBox (e.g., one time use 'plucked synth lead', next time 'euphoric supersaw lead'). Make it feel like a live performance or a carefully produced studio track.

Vary the overall song structure and VARY THE TEMPO dynamically unless the genre strictly forbids it. NO TWO GENERATIONS SHOULD HAVE THE SAME STRUCTURE! Make it unique!`;

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set.");
  }
  const ai = new GoogleGenAI({ apiKey });

  try {
    const modeInstruction = mode === 'refine'
    ? `\n\nCRITICAL REFINE MODE INSTRUCTION: The user has provided their own lyrics and wants you to REFINE them for Suno v5.5. 
    1. DO NOT change the core text of the lyrics unless there are obvious rhythmic errors.
    2. Your primary task is to INSERT structural tags ([Verse], [Chorus], etc.), vocal nuances ([Breath], [Sigh], [Vocal Fry], [Voice Crack], [Whisper], [Scream], [Laughter], [Audible Inhale]), and ad-libs between the existing lines.
    3. Use these human-like nuances sparingly and only where they fit the emotion of the song.
    4. Ensure the styleBox is still generated based on the overall vibe of the lyrics.`
    : "";

  const response = await Promise.race([
      ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze the following request and generate a professional Suno v5.5 prompt.
        
        Request: ${request}
        
        ${instrumentalInstruction}
        ${intensityInstruction}
        ${genderInstruction}
        ${productionInstruction}
        ${vocalExtrasInstruction}
        ${languageInstruction}
        ${structureInstruction}
        ${densityInstruction}
        ${tempoInstruction}
        ${energyInstruction}
        ${moodInstruction}
        ${referenceTrackInstruction}
        ${gearInstruction}
        ${qualityInstruction}
        ${varietyInstruction}
        ${modeInstruction}`,
        config: {
          maxOutputTokens: 8192,
          systemInstruction: `You are a World-Class Music Historian, Gear Expert, and Sound Designer. Your task is to EXAMINE the user's request and EVALUATE the most technically accurate musical profile possible.
          
          ### ANALYTICAL PROCESS & BEST PRACTICES (SUNO V5.5 / GOD MODE CHEATSHEET):
          1. **Deconstruct the Request:** Identify the core genre, sub-genres, and any implied eras.
          2. **Artist Profiling:** Emulate signature sounds without using real artist names. 
          3. **Style Box Priority (CRITICAL):** The Style box contains probability weights, not strict commands. The FIRST 20-30 words have the HEAVIEST weight. Put the most important genre, tempo, and vocal descriptors first. Use short descriptive tags (1-3 words per tag). Keep overall length reasonable. Put any negative prompts (e.g., "no autotune", "no piano") at the VERY END of the Style box.
          4. **Vocals & Delivery Profiling:** OVERSPECIFY the voice and use vocal emotional tags. E.g., "raspy baritone with heavy vocal fry", "ethereal whispered female vocals".

          ### CORE PRINCIPLES FOR LYRICS & STRUCTURE BOX:
          - **Structural Anchors First:** Every section MUST start with a tag in brackets before any lyrics. Use standard anchors: [Intro], [Verse 1], [Pre-Chorus], [Chorus], [Bridge], [Instrumental Solo], [Outro].
          - **Advanced Anchors:** You can use [Final Chorus], [Chorus x2], [Build Up], [Drop], [Breakdown], [Outro: Fade out], [End].
          - **Parentheses are SUNG:** NEVER use parentheses (...) for instructions. Anything in parentheses will be spoken or sung as backing vocals. Only use brackets [...] for instructions.
          - **Strict Rhythmic Meter:** Keep lines balanced in syllable count.
          - **Punctuation timing:** (.) = full breath, (,) = short pause, (...) = trailing off, (!) = energy, (—) = sharp timing/syncopation. Empty line = space for beat.
          - **Vocal Delivery Tags:** Use tags directly above lines or sections: [Whisper], [Spoken word], [Rap], [Belting], [Growled], [Operatic], [Choir: Gospel], [Autotune], [Screams].
          - **SATB / Choir Chords:** Use tags like [Multiple voice chorus s a t b] or [SATB] or [Epic Choir], but ONLY on the Chorus or Bridge. Overusing it across the whole song kills the impact.
          - **Duet Structure:** If writing a duet, you need 3 anchors: (1) state "Male and female duet" in the Style box. (2) Use a general [Duet] tag. (3) Explicitly label sections in lyrics: [Verse 1: Male], [Verse 2: Female], [Chorus: Male + Female Harmony].
          - **Ad-Libs & Emotion:** Use ALL CAPS with extended vowels for dramatic emphasis (e.g., [Scream] YEAAAHHHH/ROAAAAAR, or Oooohhh). More vowel letters = harder vocal hit. Use emotion tags: [Sad], [Angry tone], [Crying voice], [Defiant], [Joyful].
          - **Dynamics:** Add dynamic tags above sections if needed: [Soft], [Loud], [Building], [Crescendo], [Thunderous].
          
          ### CORE PRINCIPLES FOR STYLE:
          - **Focused Tags (CRITICAL VARIETY):** The styleBox CAN BE up to 250 characters. USE THEM! Pick the most descriptive, hyper-specific instruments, mixing styles, and vocal timbres. VERY IMPORTANT: To avoid songs sounding the same, CONSTANTLY INVENT NEW COMBINATIONS of descriptive keywords. NEVER use the same string of adjectives. (e.g. swap "massive supersaw" for "glitchy analog bass", "breathy female vocals" for "soulful husky alto", "cinematic atmosphere" for "claustrophobic dark ambiance"). If you keep using the same tags, the songs will all sound identical!
          - **BAN ON ARTISTS & BRANDS (CRITICAL):** Suno AI will reject the prompt and throw an error or ignore tags if you use real artist names (e.g. "Sabaton", "Tiësto") or real brand/hardware/software names (e.g. "Marshall", "Roland JP-8000", "Access Virus", "Fender", "Lexicon", "SSL", "Korg"). NEVER put these in the styleBox. Describe the *sound* instead: instead of "Marshall JCM800", use "overdriven tube amp guitars". Instead of "Roland JP-8000 supersaw", use "detuned analog supersaw synth".
          - **Voice Replication & Band Profiling:** Describe the vocal timbre, range, and technique concisely. Do NOT use artist names in the styleBox.
          - **Czech Symphonic Hard Rock (e.g., Traktor):** Example: "Czech symphonic hard rock, 80 BPM, deep emotional raspy male vocals, gritty chraplák, heavy modern rock guitars, epic orchestral strings". Structure lyrics using [Symphonic Build-up] and [Massive Epic Drop].
          - **Czech Heavy Metal Duet (e.g., Arakain & Lucie Bílá):** Keep it concise: "Czech heavy metal duet, 130 BPM, gritty male metal vocals, theatrical husky female mezzo-soprano, galloping metal guitars, dark gothic atmosphere". Structure lyrics using [Male Vocal], [Theatrical Female Vocal], [Powerful Duet].
          - **Czech Classic Pub Rock (e.g., Kabát, Škwor):** "Czech melodic hard rock, pub rock, 115 BPM, deep raspy male rock vocals, traditional overdriven guitars, driving bassline, stadium rock anthem".
          - **Local Rappers (e.g., Rytmus, Kali):** "Slovak rap, modern trap beat, 90 BPM, deep raspy male vocals, aggressive flow, heavy 808s, street hip-hop vibe".
          - **Classic/Operatic Pop (e.g., Karel Gott):** "Retro 1970s pop, schlager, majestic bel canto tenor, strong vibrato, romantic orchestral pop, big band accompaniment".
          - **Ethereal/Ambient (e.g., Enya, Erutan):** "Ethereal female vocals, new age, ambient drone, cinematic soundscape, massive reverb". In lyrics use mostly [Humming] and [Ethereal Choir].
          - **Classic Hard Rock (e.g., AC/DC):** "Classic hard rock, pub rock, 126 BPM, raspy screeching male vocals, bluesy overdrive guitars, punchy dry drums".
          - **80s Pop (e.g., Michael Jackson):** "80s dance-pop, 116 BPM, high-pitched male tenor, vocal hiccups, syncopated drum machine, analog synth bass, crisp production".
          - **Arena Pop-Rock (e.g., Imagine Dragons):** "Arena pop-rock, 105 BPM, thunderous taiko drums, deep emotional raspy male vocals, explosive belting chorus, heavy synth bass".
          - **Suno v5.5 Voice Fidelity:** Keep vocal descriptors punchy but specific: "deep baritone rap", "melodic auto-tuned chorus", "raspy throat", "operatic vibrato". Just 2 adjectives.
          - **Rave MC / Scooter Style:** For rhythmic spoken-word shouting (like Scooter), you MUST use tags like [Spoken], [Rhythmic Speech], or [Commanding MC] in the lyricsBox between lines to ensure it doesn't sound like singing or screaming.
          - **Instrumental Detail & Gear:** Specify articulations and gear (e.g., "palm-muted rhythmic guitar on a Gibson Les Paul", "slap bass with heavy parallel compression").
          - **Audio Quality & Engineering (GENRE-AWARE):** Adapt mastering tags to the genre. For Symphonic Metal (Nightwish), use "pristine symphonic mix, clear instrument separation". For Rammstein, use "clean cinematic studio mix, clear vocal presence". The application ALREADY appends global quality tags (e.g. "crystal clear mix, high-end studio production, professional mastering, pristine audio, 24-bit lossless, zero AI artifacts") at the end of every prompt, so you DO NOT need to write them yourself unless the user specifically overrides it.
          - **Industrial Metal / Neue Deutsche Härte (e.g., Rammstein):** To get the authentic Till Lindemann sound without the AI forcing screamo vocals, use a balanced prompt that includes the heavy instruments but explicitly protects the clean voice. Use this style string: "Neue Deutsche Härte, heavy industrial metal, 120 BPM, deep operatic male baritone, strictly clean vocals, Till Lindemann style, rolling German R, rhythmic chugging electric guitars, 4-on-the-floor electronic kick drum, dark techno synthesizers, cinematic atmosphere, aggressive but catchy, massive wall of sound, NO fry screams, NO guttural growls". In the lyricsBox, keep lines short and use tags like [Marching Riff], [Cold Spoken Verse], and [Deep Clean Operatic Chorus].
          - **Symphonic Metal (e.g., Nightwish):** Use tags like "operatic dramatic soprano, ethereal female vocals, cinematic orchestral layers, high-gain melodic guitars, clear instrument separation, pristine mastering".
          - **Piano Melodic Trance / Festival (e.g., Gareth Emery):** Use tags like "melodic trance, 130 BPM, epic festival piano chords, euphoric soaring melody, massive supersaw drop, rolling bassline, emotional EDM anthem". Since this is instrumental with NO SINGING, use structure tags like [Emotional Piano Breakdown], [Build-up], [Massive Festival Drop], [Acappella Choir]. Use ONLY wordless vocalizations in the lyricsBox like [Ethereal Choir] "Aaaah... Ooooh...".
          - **Big Room / EDM Festival (e.g., Dimitri Vegas):** "Big room house, 128 BPM, aggressive rave MC, stadium live performance, massive crowd noise, heavy sidechain, punchy kick, explosive drop". Structure lyrics with short hype drops (e.g. "1, 2, 3 JUMP!").
          - **Epic Uplifting Trance (e.g., Tiësto, Armin van Buuren):** "epic stadium trance, 138 BPM, ethereal female vocalise, massive analog supersaw synth, rolling 16th-note sub-bass, explosive dance drop, wide reverb mix". Let the structure drive the song using [Atmospheric intro], [Euphoric synth build-up], and [Massive Drop].
          - **Melancholic Electro Pop (e.g., Alan Walker):** Use max 150 chars: "electro pop, 90 BPM, melancholic electro house, ethereal female vocals, plucky synth lead, cinematic atmosphere, heavy sidechain, wide stereo". For the lyricsBox, focus on themes of isolation/hope, and use structural tags like [Atmospheric Intro], [Soft Verse], [Build-up], and crucially [Melodic Electro Drop] with NO singing during the drop, only instrumental.
          - **Progressive House / Folktronica (e.g., Avicii):** Use max 150 chars: "Progressive house, 128 BPM, breathy male vocals, acoustic guitar, folk-EDM fusion, stadium scale, anthemic supersaw lead, deep sub-bass". (Note: Keep it tight and focused!).
          - **Orchestral Uplifting Trance (e.g., Illitheas):** "Orchestral uplifting trance, 138 BPM, emotional cinematic, lush grand piano, weeping violin, soaring melody, layered supersaw, 16th-note sub-bass, angelic vocalise". In lyricsBox, DO NOT write normal lyrics. Use structure tags like [Beat stops!], [Grand Piano Solo], and only wordless vocals like "Aaaaah...".
          - **Sensual Latin Pop / Reggaeton Fusion (e.g., Enrique Iglesias):** Max 250 chars: "Latin dance pop, reggaeton fusion, 95 BPM, husky male tenor, nasal romantic tone, breathy passionate bedroom voice, slight pop autotune, vocal fry, Spanish acoustic guitar, syncopated dembow beat, punchy pop snare, lush modern mix". In lyrics, use tags like [Sensual Acoustic Intro], [Whispered Ad-Libs], [Dembow Beat Drops], and [Passionate Belted Chorus].
          - **80s Eurodisco / Synth-Pop (e.g., Modern Talking):** Use tags like "115 BPM, 80s Eurodisco, synth-pop, romantic male vocals, extremely high-pitched falsetto chorus, double-tracked vocal harmonies, bright analog synthesizers, Yamaha DX7 brass, driving synthesized bassline, crisp nostalgic drum machine, LinnDrum, handclaps, pristine studio mastering". In the lyricsBox, you MUST explicitly separate the lead vocal verses and the iconic falsetto chorus using tags like [Verse] and [High-Pitched Falsetto Chorus].
          - **Tempo & Key:** Specify BPM and musical key.

          ### SUNO V5.5 SPECIFICS:
          - Use [Break] for instrumental pauses.
          - Use [Beat Drop] or [Bass Drop] for energy transitions.
          - Use [Outro] followed by [Fade Out] and [End] for clean endings.
          - If an artist name is provided, replicate their ESSENCE without using their name.
          - **Language Handling:** Detect the primary language of the requested artist and write lyrics in THAT language.
          - All technical tags MUST be in English.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "A creative and fitting title for the song.",
              },
              styleBox: {
                type: Type.STRING,
                description: "A string of comma-separated tags (MAXIMUM 250 characters). It must be descriptive but focused. VERY IMPORTANT: Constantly change the descriptive adjectives and instruments used here so each song sounds uniquely textured.",
              },
              lyricsBox: {
                type: Type.STRING,
                description: "Structured lyrics including [Style Tags] for transitions.",
              },
            },
            required: ["title", "styleBox", "lyricsBox"],
          },
        },
      }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Požadavek trval příliš dlouho. Zkuste to prosím znovu.")), 45000)
      )
    ]);

    if (!response.text) {
      throw new Error("Žádná odpověď od AI. Zkuste to prosím znovu.");
    }

    let jsonStr = response.text.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.substring(7);
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.substring(3);
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.substring(0, jsonStr.length - 3);
    }

    const result = JSON.parse(jsonStr.trim());

    // Automatically append audiophile quality tags if not present, based on user's audioProduction preference
    const qualityTags = "crystal clear mix, high-end studio production, professional mastering, pristine audio";
    if (audioProduction === 'auto' || audioProduction === 'standard' || audioProduction === 'studio') {
      if (!result.styleBox.toLowerCase().includes("mastering") && !result.styleBox.toLowerCase().includes("clear mix")) {
        result.styleBox = `${result.styleBox}, ${qualityTags}`;
      }
    } else if (audioProduction === 'cinematic') {
       if (!result.styleBox.toLowerCase().includes("cinematic") && !result.styleBox.toLowerCase().includes("soundscape")) {
        result.styleBox = `${result.styleBox}, massive cinematic soundscape, Hans Zimmer style mastering, epic orchestral mix`;
       }
    } else if (audioProduction === 'festival') {
       if (!result.styleBox.toLowerCase().includes("festival") && !result.styleBox.toLowerCase().includes("live")) {
        result.styleBox = `${result.styleBox}, massive festival mainstage sound, club-ready mastering, extra heavy bass`;
       }
    }

    return result;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("429") || error.status === "RESOURCE_EXHAUSTED") {
      throw new Error("Dosáhli jste limitu požadavků pro generování promptu. Počkejte prosím minutu a zkuste to znovu.");
    }
    throw new Error(error.message || "Došlo k chybě při komunikaci s AI.");
  }
}
