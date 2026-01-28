cat > lib/groq.ts << 'EOF'
// lib/groq.ts
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface NewsResponse {
  title: string;
  category: string;
  content_web: string;
  content_whatsapp: string;
  impact: string;
}

export async function processNewsWithGroq(
  rawTitle: string,
  rawContent: string,
  source: string
): Promise<NewsResponse> {
  const prompt = `Você é um analista de notícias de tecnologia e criptomoedas. Analise a notícia abaixo e retorne APENAS um JSON válido, sem markdown, sem explicações.

NOTÍCIA:
Título: ${rawTitle}
Conteúdo: ${rawContent}
Fonte: ${source}

INSTRUÇÕES:
1. SEM EMOJIS em nenhuma parte
2. Linguagem neutra, informativa, sem opinião
3. SEM conselhos financeiros ou de investimento
4. Texto compatível com WhatsApp (texto puro)
5. Categoria: escolha entre "Crypto", "AI", "Web3", "Tech", "Blockchain"
6. Impact: escolha entre "High", "Medium", "Low"

FORMATO DE SAÍDA (JSON):
{
  "title": "Título claro e objetivo (máximo 100 caracteres)",
  "category": "Uma categoria válida",
  "content_web": "Versão detalhada da notícia, 3-4 parágrafos, explicando o contexto, o que aconteceu e possíveis implicações. Linguagem clara e profissional.",
  "content_whatsapp": "Versão resumida em 2-3 frases curtas, direto ao ponto, formatada para ser copiada no WhatsApp. Máximo 280 caracteres.",
  "impact": "Nível de impacto da notícia"
}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from Groq API');
    }

    const parsed = JSON.parse(content) as NewsResponse;

    // Validação básica
    if (!parsed.title || !parsed.category || !parsed.content_web || !parsed.content_whatsapp || !parsed.impact) {
      throw new Error('Invalid response structure from Groq API');
    }

    return parsed;
  } catch (error) {
    console.error('Error processing news with Groq:', error);
    throw error;
  }
}

export default groq;
EOF