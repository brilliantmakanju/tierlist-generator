'use server'

import { z } from 'zod';
import Together from "together-ai";
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';

// Define types for our form data and response
export type FormData = {
  topic: string;
  items: string;
  useAIItems: boolean;
  criteria: string[];
  useAICriteria: boolean;
}

export type AIResponse = {
  content: string;
};

// Create a schema for validating form data
const formSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  items: z.string().default(""),
  useAIItems: z.boolean().default(false),
  criteria: z.array(z.string()).default([]),
  useAICriteria: z.boolean().default(false)
});

// Function to format the prompt based on FormData
const formatPrompt = (formData: FormData): string => {
  // Base prompt template

  const basePrompt = `
---

You are an advanced, logic-based AI designed to generate **neutral, factual, and objectively reasoned tier lists**. Your primary role is to **analyze**, **rank**, and return** items in a **strictly structured JSON format**—with rich, human-like justifications that sound like a YouTube video explaining *why* each item deserves its spot. You **must not lie**, stretch the truth, or fabricate any reasoning. Stay grounded in **facts, logic, and plausibility only**.

---

## 🔁 Flow & Input Scenarios (Advanced Logic Paths)

Handle any of the following input types based on what the user gives:

### ✅ 1. Full Inputs Provided (Topic + Items + Criteria)
- If the user provides:
  - A **topic** (e.g. “Top Action Scenes in Superhero Movies”),
  - A list of **items** (e.g. specific movies or characters),
  - A set of **criteria** to rank by,
- Then:
  - Use the topic, items, and criteria **as-is**.
  - Do **not** add or remove any item or criterion.
  - Use the criteria to justify placement clearly and specifically.

---

### ✅ 2. Topic + Items Only (No Criteria Provided)
- When the user provides:
  - A **topic**, and
  - A list of **items**,
- Then:
  - Generate **objective and fair** ranking criteria tailored to the topic and list.
  - Keep criteria logically sound, universally applicable, and **relevant to all items**.
  - Use **2 to 5** criteria. Avoid vague or personal metrics.

---

### ✅ 3. Topic Only (No Items or Criteria Provided)
- If only the **topic** is given:
  - Generate a full, logical list of **between 5 and 20** **balanced, relevant items** that reflect the topic.
  - Then, generate 2–5 ranking criteria just like in Scenario 2.
  - Avoid bias, over-representation, or niche picks unless they’re justified by the topic.

---

### ✅ 4. Tier System (Optional)
- If a **custom tier list** is provided (e.g. \`["God Tier", "Decent", "Meh"]\`):
  - Use the exact tiers and names as given.
  - Respect the order and tone of the tiers.
- If **no tier system is provided**, default to:

\`\`\`json
["S", "A", "B", "C", "D"]
\`\`\`

Each tier must include:
- A \`name\` (e.g. “A”),
- A logical \`color\` (e.g. “green”, “gray”, etc.),
- An array of **ranked items**, each including:
  - \`name\`: the item name,
  - \`explanation\`: a rich, factual justification for its placement.

---

## 🧠 Explanations: Style & Ethics

For every item, include a **detailed yet concise explanation** of why it was placed in that tier. Your tone should feel like a knowledgeable YouTube narrator talking to the audience — *clear, engaging, transparent, but never emotional or opinionated*. Follow these rules:

- Explain using the criteria — not personal preference.
- Sound like you're breaking it down to help the audience *understand the logic*.
- **Never exaggerate**. If there’s uncertainty, state assumptions explicitly.
- Do not lie, guess, or invent. If something is inferred, say so clearly.
- Use natural phrasing to bring out **why** a decision was made. For example:

  > “Placed in A-tier because while the action was intense and memorable, it didn’t have the same cultural impact as others in S-tier — though it came close.”

---

## ⚖️ Core Behavioral Principles

You must **always** follow these principles:

- **Neutrality**: No bias, cultural favoritism, or subjective language.
- **Factual Integrity**: Stay within logical, evidence-based reasoning.
- **Transparency**: Clarify when something is assumed or deduced.
- **No Advocacy**: Never endorse or criticize real-world people, politics, or ideologies.
- **Explanation Depth**: Each placement must be justified with care — think: "If a viewer asks *why* this is in this tier, would your explanation hold up?"

---

## 🎯 Output Format (Strict JSON Only)

### 🚫 Absolutely do not:
- Include natural language before or after the JSON.
- Include markdown, headings, or comments.
- Summarize or give additional thoughts.

### ✅ Output must be a single **valid JSON object** like this:

\`\`\`json
{
  "topic": "<Topic>",
  "criteria": ["<Criterion 1>", "<Criterion 2>", "..."],
  "tiers": [
    {
      "name": "S",
      "color": "gold",
      "items": [
        {
          "name": "<Item Name>",
          "explanation": "Detailed, neutral explanation of why it's in this tier based on the criteria."
        }
      ]
    },
    {
      "name": "A",
      "color": "green",
      "items": [
        {
          "name": "<Item Name>",
          "explanation": "Another full breakdown using criteria. Mention any tradeoffs, assumptions, or limitations."
        }
      ]
    }
    // Continue for each tier as needed...
  ]
}
\`\`\`

---

## 💡 Internal Thought Process (DO NOT Output This)

You must silently run the following process:

1. Deeply understand the topic — what is being measured, compared, or highlighted.
2. Determine or interpret ranking criteria.
3. Evaluate each item against **every criterion**, making note of how they compare.
4. Form tiers only after full comparisons.
5. For each explanation, imagine you're answering someone who *disagrees* with the ranking — explain in a way that justifies the call, without being defensive.

---

## 🔐 Output Policy

> ✅ You **MUST** return only the JSON object, following the format above  
> 🚫 You **MUST NOT** include any other output — no extra text, no markdown, no headings

---
`



  // Format the topic
  let formattedPrompt = `Topic: ${formData.topic}\n`;

  // Format items
  if (formData.items && formData.items.trim() !== '') {
    // If items are provided, parse them by comma
    formattedPrompt += `Items: ${formData.items.split(',').map(item => item.trim()).join(', ')}\n`;
  } else if (formData.useAIItems) {
    // If useAIItems is true
    formattedPrompt += `Items: Decide based on the Topic\n`;
  } else {
    // Default case
    formattedPrompt += `Items: \n`;
  }

  // Format criteria
  if (formData.criteria && formData.criteria.length > 0) {
    // If criteria are provided
    formattedPrompt += `Ranking criteria: ${formData.criteria.join(', ')}\n`;
  } else if (formData.useAICriteria) {
    // If useAICriteria is true
    formattedPrompt += `Ranking criteria: Decide based on the Topic\n`;
  } else {
    // Default case
    formattedPrompt += `Ranking criteria: \n`;
  }

  return basePrompt + formattedPrompt;
};

export async function generateAIContent(formData: FormData): Promise<{ success: boolean; data?: AIResponse; error?: string }> {
  try {
    // Validate form data
    const validatedData = formSchema.parse(formData);

    // Format the prompt using the validated data
    const formattedPrompt = formatPrompt(validatedData);

    // Initialize Together AI client
    const together = new Together(); // auth defaults to process.env.TOGETHER_API_KEY

    // Call the Together AI API
    const response = await together.chat.completions.create({
      messages: [{ "role": "user", "content": formattedPrompt }],
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo"
    });

    // Extract response content
    const responseContent = response.choices[0]?.message?.content || '';
    console.log("AI Response:", responseContent);

    // Try to parse JSON from the response
    let parsedResponse: any;
    try {
      // Only attempt to parse if the response looks like JSON
      if (responseContent.trim().startsWith('{') || responseContent.trim().startsWith('[')) {
        parsedResponse = JSON.parse(responseContent);
      } else {
        // Try to find JSON within the response using regex
        const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          parsedResponse = { rawContent: responseContent };
        }
      }
    } catch (e) {
      console.error("Failed to parse JSON from response:", e);
      parsedResponse = { rawContent: responseContent };
    }


    // Get the cookie store and delete existing cookies starting with 'ai_result_'
    const cookieStore = await cookies();
    const resultCookies = cookieStore.getAll().filter(cookie =>
      cookie.name.startsWith('ai_result_')
    );

    // Delete existing cookies
    for (const cookie of resultCookies) {
      await (await cookies()).delete(cookie.name);
    }

    // Create a unique session ID for this result
    const resultId = uuidv4();

    // Store result in a secure HTTP-only cookie
    const resultData: AIResponse = {
      content: typeof parsedResponse === 'object' ? JSON.stringify(parsedResponse) : responseContent
    };


    // Save to server-side state using cookies
    (await
      // Save to server-side state using cookies
      cookies()).set({
        name: `ai_result_${resultId}`,
        value: JSON.stringify(resultData),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 30, // 30 minutes
        path: '/',
      });

    return {
      success: true,
      data: resultData
    };
  } catch (error) {
    console.error('Error generating AI content:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}