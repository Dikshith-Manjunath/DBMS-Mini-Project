import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Read the SQL file
    const filePath = path.join(process.cwd(), 'src', 'lib', 'users-schema.sql');
    const sqlScript = await fs.readFile(filePath, 'utf8');
    
    // Execute the SQL script
    await pool.query(sqlScript);
    
    return NextResponse.json({
      success: true,
      message: 'Users table created successfully'
    });
  } catch (error) {
    console.error('Error creating users table:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create users table',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}