import { CohereClient } from "cohere-ai";

export const runtime = "nodejs"; // Set runtime to nodejs

// Initialize Cohere with the API key from environment variables
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY as string,
});

export async function POST(req: Request) {
  try {
    // Parse the request body as JSON
    const { messages } = await req.json();

    // Extract the latest message content
    const userMessage = messages?.[messages.length - 1]?.content;
    if (!userMessage || typeof userMessage !== "string") {
      throw new Error(
        "message: Expected string. Received " + typeof userMessage
      );
    }

    // Log the user message to the console
    console.log(`User: ${userMessage}`);

    // Call Cohere's chatStream method
    const stream = await cohere.chatStream({
      model: "command-r-plus-08-2024",
      message: userMessage,
    });

    // AI response accumulator
    let aiResponse = "";

    // Create a ReadableStream to stream the response
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            // Check event type and access the appropriate data
            if (chunk.eventType === "text-generation") {
              const textContent = chunk.text;
              if (textContent) {
                aiResponse += textContent; // Accumulate AI response

                // Stream the chunk to the frontend
                controller.enqueue(new TextEncoder().encode(textContent));
              }
            }
          }
          controller.close(); // Close the stream when done

          // Log the full AI response to the console
          console.log(`Assistant: ${aiResponse}`);
        } catch (err) {
          console.error("Streaming error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error during chat:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
