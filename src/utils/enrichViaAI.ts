import OpenAI from 'openai';

function buildPrompt(email: string): string {
  return `Analyze this email address and determine if it's a personal email or a business email.

For personal emails (like gmail.com, yahoo.com, etc.), return exactly:
Company:
Industry:

For business emails, return exactly:
Company: Company Name
Industry: Industry Name

Email: ${email}

Rules:
1. For personal emails, leave both fields blank (just the labels)
2. For business emails, provide the actual company name and industry
3. Do not include any explanatory text
4. Do not include brackets or placeholder text
5. If unsure, treat as personal email and leave fields blank
6. Do not include the word "Industry" in the company field
7. Do not include any additional text or formatting`;
}

function normalize(value?: string | null): string | null {
  if (!value) return null;
  
  const cleaned = value.trim();
  
  // Check for empty or placeholder values
  if (
    cleaned === '' ||
    cleaned.toLowerCase().includes('leave blank') ||
    cleaned.toLowerCase().includes('or leave blank') ||
    cleaned.includes('[') ||
    cleaned.includes(']') ||
    cleaned.toLowerCase().includes('personal') ||
    cleaned.toLowerCase().includes('unknown') ||
    cleaned.toLowerCase().includes('n/a') ||
    cleaned.toLowerCase().includes('none') ||
    cleaned.toLowerCase().includes('industry') // Additional check for "industry" in company field
  ) {
    return null;
  }
  
  return cleaned;
}

export async function enrichViaAI(email: string): Promise<{ company: string | null; industry: string | null }> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that analyzes email addresses to determine company and industry information. You must respond in the exact format specified, with no additional text or explanations."
        },
        {
          role: "user",
          content: buildPrompt(email)
        }
      ],
      temperature: 0,
      max_tokens: 100
    });

    const result = completion.choices[0]?.message?.content || '';
    console.log('AI Response:', result);

    // Extract company and industry using regex, ensuring proper line breaks
    const companyMatch = result.match(/^Company:\s*(.*?)(?:\n|$)/im);
    const industryMatch = result.match(/^Industry:\s*(.*?)(?:\n|$)/im);

    // Normalize and validate the extracted values
    return {
      company: normalize(companyMatch?.[1]),
      industry: normalize(industryMatch?.[1])
    };
  } catch (error) {
    console.error('Error enriching contact:', error);
    return { company: null, industry: null };
  }
} 