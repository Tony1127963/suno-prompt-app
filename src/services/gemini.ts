import { GoogleGenAI, Type } from "@google/genai";

export type VocalIntensity = 'auto' | 'soft' | 'normal' | 'powerful' | 'operatic' | 'aggressive' | 'shouting_mc' | 'dynamic';
export type AudioProduction = 'auto' | 'standard' | 'studio' | 'cinematic' | 'live';
export type VocalExtras = 'auto' | 'none' | 'choir' | 'harmonies' | 'intimate' | 'vocoder' | 'autotune' | 'megaphone' | 'humanized';
export type VocalGender = 'auto' | 'male' | 'female' | 'both';
export type StructureType = 'auto' | 'standard' | 'edm' | 'rap' | 'classical' | 'ambient';
export type VocalDensity = 'auto' | 'dense' | 'sparse' | 'chops';

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
}> {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey: apiKey || '' });
  try {
    const response = await ai.models.generateContent({
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
2. Identify their signature instruments (e.g., "The Edge's dotted-eighth delay", "Kurt Cobain's Small Clone chorus").
3. Recommend specific gear in the 'studioGear' field.
4. Adjust 'vocalIntensity' and 'vocalExtras' to match the singer's unique delivery.
        
Available Vocal Intensity: 'auto', 'soft', 'normal', 'powerful', 'operatic', 'aggressive', 'shouting_mc', 'dynamic'
Available Audio Production: 'auto', 'standard', 'studio', 'cinematic', 'live'
Available Vocal Extras: 'auto', 'none', 'choir', 'harmonies', 'intimate', 'vocoder', 'autotune', 'megaphone', 'humanized'
Available Vocal Gender: 'auto', 'male', 'female', 'both'
Available Structure Types: 'auto', 'standard' (pop/rock), 'edm' (build-ups/drops), 'rap' (verses/hooks), 'classical' (movements/sonatas), 'ambient' (flowing/evolving)
Available Vocal Density: 'auto', 'dense' (lots of lyrics), 'sparse' (mostly instrumental, occasional phrases), 'chops' (vocal samples only)

CRITICAL: For 'shouting_mc', use it for high-energy rave/dancefloor MCs (like Scooter). For 'operatic', use it for clean, powerful classical/symphonic vocals (like Nightwish).
For 'studioGear', be as specific as possible (e.g., "Neumann U87, SSL Console, Moog One").
LANGUAGE RULES: 
1. If a specific band/artist is identified (e.g., Scooter, Rammstein), you MUST set the language to the language they typically sing in (e.g., 'English' for Scooter, 'German' for Rammstein), REGARDLESS of what language the user used to write the prompt.
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
            studioGear: {
              type: Type.STRING,
              description: "Recommended specific studio gear or instruments (e.g., 'Fender Stratocaster, Vintage Tube Amp')",
            },
          },
          required: ["vocalIntensity", "audioProduction", "vocalExtras", "vocalGender", "isInstrumental", "language", "structureType", "vocalDensity", "studioGear"],
        },
      },
    });

    if (!response.text) {
      throw new Error("Žádná odpověď od AI.");
    }

    return JSON.parse(response.text.trim());
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Nepodařilo se doporučit nastavení.");
  }
}

export async function generateAlbumArt(title: string, style: string): Promise<string | null> {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey: apiKey || '' });

  try {
    const response = await ai.models.generateContent({
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
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned from the model.");
  } catch (error: any) {
    console.error("Album Art Generation Error:", error);
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
    aggressive: 'aggressive shouting, harsh vocals, fry screams, guttural growls, gritty, raspy, distorted vocal delivery, high intensity.',
    shouting_mc: 'high energy rhythmic shouting MC, powerful rave MC, hype man vocals, aggressive rhythmic projection, energetic dancefloor MC, crisp high-end, commanding presence, slight megaphone grit, clear but powerful shouting.',
    dynamic: 'dynamic vocal range, soft breathy verses building to powerful soaring choruses, clean vocals only, wide dynamic range, expressive delivery, NO screaming. Use structural tags like [Soft Intimate Verse] and [Explosive Powerful Chorus].'
  };

  const intensityInstruction = vocalIntensity !== 'auto' && !isInstrumental && intensityMap[vocalIntensity]
    ? `\n\nCRITICAL VOCAL INTENSITY: The user set intensity to '${vocalIntensity}'. Enforce this using these tags/style: ${intensityMap[vocalIntensity]}`
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
    studio: 'studio recording, mastered, crisp mix, high fidelity, lossless',
    cinematic: 'cinematic mix, Dolby Atmos, wide soundstage, epic reverb, massive wall of sound',
    live: 'live performance, stadium acoustics, raw energy, crowd noise in background'
  };

  const productionInstruction = audioProduction !== 'standard' && audioProduction !== 'auto' && productionMap[audioProduction]
    ? `\n\nAUDIO PRODUCTION: The user set production to '${audioProduction}'. Use these tags: ${productionMap[audioProduction]}`
    : "";

  const extrasMap: Record<string, string> = {
    choir: 'Add "epic choir backing, massive vocal harmonies, choral arrangement" to Style. Use [Choir] or [Epic Choir] in lyrics.',
    harmonies: 'Add "vocal harmonies, layered vocals, double tracked vocals" to Style. Use [Harmonies] in lyrics.',
    intimate: 'Add "close-mic vocals, audible breaths, ASMR-like, intimate vocal delivery, human nuances, delicate phrasing" to Style. Use [Breath], [Sigh], [Whisper], [Vocal Fry] in the lyricsBox between lines.',
    vocoder: 'Add "robotic vocoder, Daft Punk style vocals, synthesized voice" to Style. Use [Vocoder] in lyrics.',
    autotune: 'Add "heavy autotune, modern trap vocals, pitch corrected, melodic rap" to Style. Use [Autotune] in lyrics.',
    megaphone: 'Add "megaphone effect, radio filter, lo-fi vocals, distorted telephone voice" to Style. Use [Megaphone] in lyrics.',
    humanized: 'Add "extreme human nuances, audible breaths, vocal fry, emotional delivery, realistic phrasing, voice cracks" to Style. Suno v5.5 excels at this. Use [Breath], [Sigh], [Vocal Fry], [Voice Crack], [Emotional Crescendo] naturally between lines in the lyricsBox.'
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
    ambient: 'Use tags like [Atmospheric Intro], [Evolving Soundscape], [Drone], [Fade Out].'
  };

  const structureInstruction = structureType !== 'standard' && structureType !== 'auto' && structureMap[structureType]
    ? `\n\nSONG STRUCTURE: The user set structure to '${structureType}'. Enforce this: ${structureMap[structureType]}`
    : "";

  const gearInstruction = studioGear !== 'auto' && studioGear.trim() !== '' ? `
\n\nSTUDIO GEAR: The user requested '${studioGear}'. Incorporate into Style box (e.g., "recorded with ${studioGear}") and describe sound characteristics.
` : "";

  const densityMap: Record<string, string> = {
    dense: 'The song should be packed with lyrics. Long verses, continuous singing.',
    sparse: 'MOSTLY INSTRUMENTAL with occasional vocal phrases. Use tags like [Long Instrumental Build-up], [Massive Drop], and keep text lines very short. Do NOT write full verses.',
    chops: 'NO traditional singing. Only use [Vocal Chops], [Wordless Melodies], or [Chants].'
  };

  const densityInstruction = vocalDensity !== 'auto' && !isInstrumental && densityMap[vocalDensity]
    ? `\n\nVOCAL DENSITY: The user set density to '${vocalDensity}'. Enforce this: ${densityMap[vocalDensity]}`
    : "";


  const qualityInstruction = `\n\nCRITICAL AUDIO QUALITY REQUIREMENT:
To ensure the best possible sound delivery and vocal clarity, you MUST always append high-quality mastering tags to the Style box (e.g., "mastered, high fidelity, crisp mix, clear vocals, professional production"), UNLESS the user explicitly requested a lo-fi, vintage, or raw sound.`;

  const varietyInstruction = `\n\nCRITICAL VARIETY INSTRUCTION: 
To ensure the user gets a unique song every time they click generate, here is a random seed: ${Math.random()}. 
Even if the user's request is simple or identical to a previous one (e.g., just a band name like "Paul van Dyk"), you MUST generate COMPLETELY NEW lyrics, a different song structure, and vary the musical key and exact BPM slightly. Do not reuse the exact same melodies, chord progressions, or lyrical themes as standard defaults. Make it unique!`;

  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey: apiKey || '' });

  try {
    const modeInstruction = mode === 'refine'
    ? `\n\nCRITICAL REFINE MODE INSTRUCTION: The user has provided their own lyrics and wants you to REFINE them for Suno v5.5. 
    1. DO NOT change the core text of the lyrics unless there are obvious rhythmic errors.
    2. Your primary task is to INSERT structural tags ([Verse], [Chorus], etc.), vocal nuances ([Breath], [Sigh], [Vocal Fry], [Voice Crack], [Whisper], [Scream], [Laughter], [Audible Inhale]), and ad-libs between the existing lines.
    3. Use these human-like nuances sparingly and only where they fit the emotion of the song. Suno v5.5 is highly expressive, so use dynamic tags like [Emotional Crescendo] or [Sudden Drop].
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
        ${gearInstruction}
        ${qualityInstruction}
        ${varietyInstruction}
        ${modeInstruction}`,
        config: {
          maxOutputTokens: 8192,
          systemInstruction: `You are a World-Class Music Historian, Gear Expert, and Sound Designer. Your task is to EXAMINE the user's request and EVALUATE the most technically accurate musical profile possible to replicate a specific artist's "DNA".
          
          ### ANALYTICAL PROCESS:
          1. **Deconstruct the Request:** Identify the core genre, sub-genres, and any implied musical eras.
          2. **Artist Identification:** If the request contains lyrics or a band name, ACCESS your deep knowledge of their discography, signature sounds, and studio setup.
          3. **Identify Signature Instruments:** What specific instruments define their sound? (e.g., "The Edge's dotted-eighth delay", "Kurt Cobain's Small Clone chorus", "H.P. Baxxter's signature shouting style").
          4. **Vocal Profiling:** Deconstruct the identified artist's vocal timbre, range, and technique into technical descriptions (e.g., "raspy baritone with heavy vocal fry", "high energy rhythmic shouting MC with crisp projection").
          5. **Structural Design:** Design a dynamic progression that matches the artist's typical song structure, including builds and drops.

          ### CORE PRINCIPLES FOR LYRICS:
          - **Strict Rhythmic Meter:** You MUST ensure that lines within the same section (e.g., Verse 1) have a consistent and balanced syllable count.
          - **Syllable Balancing:** Avoid "clunky" lines that are too long or too short for the established tempo (BPM). 
          - **Natural Phrasing:** Avoid generic AI-sounding rhymes (e.g., "fire/desire"). Use internal rhymes, slant rhymes, and conversational language.
          - **Structural Precision:** Use descriptive tags like [Atmospheric Intro], [Explosive Powerful Chorus], [Stripped-down Acoustic Bridge], [Call and Response], [Gang Vocals].
          - **Vocal Direction:** Use tags like [Breath], [Sigh], [Vocal Fry], [Voice Crack], [Whisper], [Scream], [Laughter], [Audible Inhale] strategically to enhance realism.

          ### CORE PRINCIPLES FOR STYLE:
          - **Voice Replication & Band Profiling:** Describe the vocal timbre, range, and technique in extreme detail. Do NOT use artist names in the styleBox.
          - **Local/Niche Bands (e.g., Kabát, Walda Gang):** Translate these into their exact musical essence (e.g., "energetic Czech pub rock, raspy chest-voice male vocals with heavy vocal fry, driving rhythmic electric guitars").
          - **Instrumental Detail & Gear:** Specify articulations and gear (e.g., "palm-muted rhythmic guitar on a Gibson Les Paul", "slap bass with heavy parallel compression").
          - **Audio Quality & Engineering:** Always include mastering tags like "mastered, high fidelity, crisp mix, clear vocals, wide stereo imaging, warm analog saturation".
          - **Tempo & Key:** Specify BPM and musical key.

          ### SUNO V5.5 SPECIFICS:
          - Suno v5.5 is highly expressive. Use advanced dynamic shift tags like [Sudden Drop], [Emotional Crescendo], [Acapella Break], and [Whisper to Scream].
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
                description: "A detailed string of tags (max 1000 characters).",
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

    return JSON.parse(jsonStr.trim());
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Došlo k chybě při komunikaci s AI.");
  }
}
