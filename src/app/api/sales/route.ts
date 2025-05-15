import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Get total count
    const totalResult = await pool.query('SELECT COUNT(*) FROM sales');
    const total = parseInt(totalResult.rows[0].count);

    // Get paginated data
    const result = await pool.query(
      `SELECT "Transaction ID", Date, "Customer ID", Gender, Age, 
              "Product Category", Quantity, "Price per Unit", "Total Amount"
       FROM sales 
       ORDER BY "Transaction ID" 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return NextResponse.json({
      sales: result.rows,
      total,
      page,
      limit
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales data' },
      { status: 500 }
    );
  }
}