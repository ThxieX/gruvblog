import {
  consumeStream,
  convertToModelMessages,
  streamText,
  UIMessage,
} from 'ai'
import { getPosts } from '@/lib/blog-data'

export const maxDuration = 30

// Create context about the blog posts for the AI
function getBlogContext() {
  const posts = getPosts()
  return posts.map(post =>
    `Title: ${post.title}\nExcerpt: ${post.excerpt}\nTags: ${post.tags.join(', ')}\nCategories: ${post.categories.join(' > ')}\nContent Summary: ${post.aiSummary || post.excerpt}`
  ).join('\n\n---\n\n')
}

const blogContext = getBlogContext()

const systemPromptBase = `You are an AI assistant for Thxie's personal blog. Thxie is a programmer who is passionate about AI and minimalism.

You have access to information about the blog posts. Here is a summary of the available content:

${blogContext}

Your role:
- Answer questions about the blog content, Thxie's interests, and the topics covered
- Suggest relevant posts based on what the user is interested in
- Explain technical concepts mentioned in the posts
- Be helpful, concise, and friendly
- If asked about something not covered in the blog, you can still help but mention that Thxie hasn't written about it yet

Keep responses concise and to the point. Use markdown formatting when appropriate.`



export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: 'openai/gpt-4o-mini',
    system: systemPromptBase,
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    consumeSseStream: consumeStream,
  })
}
