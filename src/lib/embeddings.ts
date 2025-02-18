import { CohereClient } from "cohere-ai";

// Initialize Cohere with the API key from environment variables
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY as string,
});

export async function getEmbeddings(text: string): Promise<number[]> {
  try {
    const response = await cohere.v2.embed({
      texts: [text.replace(/\n/g, " ")], // Input the text you want to embed
      model: "embed-english-v3.0", // Use the desired model for embeddings
      inputType: "search_document", // Specify that you're embedding text
      embeddingTypes: ["float"],
    });

    console.log("Cohere API response:", JSON.stringify(response, null, 2));

    // Ensure there's valid data in the response
    if (
      !response.embeddings ||
      !Array.isArray(response.embeddings.float) ||
      response.embeddings.float.length === 0
    ) {
      throw new Error("Cohere API returned an empty response.");
    }
    return response.embeddings.float[0] as number[];
  } catch (error) {
    console.error("Error calling cohere embeddings API:", error);
    throw error;
  }
}
