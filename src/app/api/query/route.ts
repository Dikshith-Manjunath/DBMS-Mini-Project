import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    
    // Validate that query exists
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter is required and must be a string' },
        { status: 400 }
      );
    }

    const prompt = `Convert the following question into a SQL query for a sales database with this schema:
CREATE TABLE sales(
  "Transaction ID" INTEGER PRIMARY KEY,
  Date DATE,
  "Customer ID" VARCHAR(8),
  Gender VARCHAR(6),
  Age INTEGER,
  "Product Category" VARCHAR(11),
  Quantity INTEGER,
  "Price per Unit" INTEGER,
  "Total Amount" INTEGER
);
Question: ${query}
Return only the SQL query without any explanations.`;

    // Convert natural language to SQL using OpenAI
    const sqlQuery = await generateSqlQuery(prompt);
    
    // Execute the SQL query against the database
    const result = await pool.query(sqlQuery);
    
    return NextResponse.json({
      response: 'Here is the data for your query:',
      sqlQuery,
      data: result.rows
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to process query', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Helper function to generate SQL using OpenAI
 */
async function generateSqlQuery(prompt: string): Promise<string> {
  // Check if API key is available
  if (!process.env.NVIDIA_API_KEY) {
    throw new Error('NVIDIA_API_KEY is not defined in environment variables');
  }

  const openai = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: "https://integrate.api.nvidia.com/v1",

  });

  try {
    const completion = await openai.chat.completions.create({
      model: "nvidia/llama-3.1-nemotron-ultra-253b-v1",  // Use appropriate model
      messages: [
        {
          role: "system",
          content: "You are a SQL expert. Convert natural language questions to SQL queries. Return only the SQL query without explanations or markdown formatting."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 150,
    });

    // Extract the SQL query from the response
    const sqlQuery = completion.choices[0].message.content?.trim();
    
    if (!sqlQuery) {
      throw new Error('Failed to generate SQL query');
    }
    
    return sqlQuery;
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    throw new Error(`Failed to generate SQL query: ${error.message}`);
  }
}