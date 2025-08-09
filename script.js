// Get all the HTML elements we need to work with
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const loading = document.getElementById('loading');
const results = document.getElementById('results');

const transcriptInput = document.getElementById('transcriptInput');
const topicInput = document.getElementById('topicInput');

const analyzeBtn = document.getElementById('analyzeBtn');
const generateBtn = document.getElementById('generateBtn');

const styleGuideOutput = document.getElementById('styleGuideOutput');
const scriptOutput = document.getElementById('scriptOutput');

let generatedStyleGuide = ""; // Variable to store the analyzed style

// Event listener for the "Analyze" button
analyzeBtn.addEventListener('click', async () => {
    const transcript = transcriptInput.value;
    if (transcript.trim() === "") {
        alert("Please paste a transcript first.");
        return;
    }

    // Show loading, hide other sections
    loading.classList.remove('hidden');
    loading.innerText = "Analyzing Style... Please wait.";
    step2.classList.add('hidden');
    results.classList.add('hidden');

    // This is the prompt for the first step: analysis
    const analysisPrompt = `
        Act as an expert YouTube script analyst. Analyze the following transcript and create a "Style Guide" based on it. The style guide should be concise and cover these key points:
        1.  **Tone & Vibe:** (e.g., Energetic and comedic, Calm and educational, Witty and sarcastic)
        2.  **Pacing:** (e.g., Fast-paced with short sentences, Deliberate and thoughtful)
        3.  **Vocabulary:** (e.g., Simple and accessible, Technical and precise)
        4.  **Audience Address:** (e.g., Speaks directly to "you", Tells stories, Acts like a friend)
        5.  **Hook Style:** (e.g., Asks a question, States a bold claim, Starts in the middle of the action)

        Here is the transcript:
        ---
        ${transcript}
        ---
    `;

    try {
        // Send the prompt to our secure serverless function
        const response = await fetch('/.netlify/functions/getAiScript', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: analysisPrompt }),
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        generatedStyleGuide = data.reply; // Save the analyzed style

        // Display the style guide and show the next step
        styleGuideOutput.innerText = generatedStyleGuide;
        step1.classList.add('hidden');
        step2.classList.remove('hidden');

    } catch (error) {
        console.error("Error analyzing style:", error);
        alert("An error occurred. Please check the console for details.");
    } finally {
        loading.classList.add('hidden');
    }
});

// Event listener for the "Generate" button
generateBtn.addEventListener('click', async () => {
    const topic = topicInput.value;
    if (topic.trim() === "") {
        alert("Please enter a topic for your new video.");
        return;
    }

    // Show loading
    loading.classList.remove('hidden');
    loading.innerText = "Generating Script... This might take a moment.";
    results.classList.add('hidden');

    // This is the prompt for the second step: generation
    // It uses the style guide we created in the first step!
    const generationPrompt = `
        Act as an expert YouTube scriptwriter. Your task is to write a script outline for a new video.
        You MUST strictly follow the style defined in the "Style Guide" below.

        **Style Guide to Follow:**
        ---
        ${generatedStyleGuide}
        ---

        **New Video Topic:**
        "${topic}"

        Please generate a script outline including:
        - A powerful Hook that matches the style.
        - A brief Introduction.
        - 3-4 Main Body points.
        - A clear Call to Action (CTA).
        - Suggested B-roll or visual cues in parentheses (like this).
    `;

    try {
        // Send the new prompt to our secure serverless function
        const response = await fetch('/.netlify/functions/getAiScript', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: generationPrompt }),
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        
        // Display the final script
        scriptOutput.innerText = data.reply;
        results.classList.remove('hidden');

    } catch (error) {
        console.error("Error generating script:", error);
        alert("An error occurred. Please check the console for details.");
    } finally {
        loading.classList.add('hidden');
    }
});