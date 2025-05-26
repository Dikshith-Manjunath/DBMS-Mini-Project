import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table') || 'sales';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Validate table name
    const validTables = ['sales', 'categories', 'products', 'customers', 'transactions', 'transaction_details'];
    if (!validTables.includes(table)) {
      return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
    }

    // Get total count
    const totalResult = await pool.query(`SELECT COUNT(*) FROM ${table}`);
    const total = parseInt(totalResult.rows[0].count);

    // Get paginated data with proper order by clause based on table schema
    let orderByClause;
    switch(table) {
      case 'sales':
        orderByClause = '"Transaction ID"';
        break;
      case 'categories':
        orderByClause = 'category_id';
        break;
      case 'products':
        orderByClause = 'product_id';
        break;
      case 'customers':
        orderByClause = 'customer_id';
        break;
      case 'transactions':
        orderByClause = 'transaction_id';
        break;
      case 'transaction_details':
        orderByClause = 'detail_id';
        break;
      default:
        orderByClause = 'id';
    }
    
    let query;
    
    // Table-specific queries to fetch the right columns with proper formatting/joins
    switch(table) {
      case 'sales':
        query = `
          SELECT "Transaction ID", 
                 Date as date, 
                 "Customer ID", 
                 Gender as gender, 
                 Age as age, 
                 "Product Category", 
                 Quantity as quantity, 
                 "Price per Unit", 
                 "Total Amount"
          FROM sales 
          ORDER BY ${orderByClause} 
          LIMIT $1 OFFSET $2`;
        break;
      case 'categories':
        query = `
          SELECT 
            category_id as "Category ID", 
            category_name as "Category Name", 
            description as "Description", 
            to_char(created_at, 'YYYY-MM-DD HH24:MI:SS') as "Created At"
          FROM categories 
          ORDER BY ${orderByClause} 
          LIMIT $1 OFFSET $2`;
        break;
      case 'products':
        query = `
          SELECT 
            p.product_id as "Product ID", 
            p.product_name as "Product Name", 
            c.category_name as "Category", 
            p.price as "Price", 
            p.cost as "Cost", 
            p.sku as "SKU", 
            p.in_stock as "In Stock", 
            to_char(p.created_at, 'YYYY-MM-DD HH24:MI:SS') as "Created At"
          FROM products p
          JOIN categories c ON p.category_id = c.category_id
          ORDER BY p.${orderByClause} 
          LIMIT $1 OFFSET $2`;
        break;
      case 'customers':
        query = `
          SELECT 
            customer_id as "Customer ID", 
            gender as "Gender", 
            age as "Age", 
            to_char(date_registered, 'YYYY-MM-DD') as "Date Registered" 
          FROM customers 
          ORDER BY ${orderByClause} 
          LIMIT $1 OFFSET $2`;
        break;
      case 'transactions':
        query = `
          SELECT 
            transaction_id as "Transaction ID", 
            customer_id as "Customer ID", 
            to_char(transaction_date, 'YYYY-MM-DD') as "Transaction Date", 
            total_amount as "Total Amount", 
            payment_method as "Payment Method",
            status as "Status"
          FROM transactions 
          ORDER BY ${orderByClause} 
          LIMIT $1 OFFSET $2`;
        break;
      case 'transaction_details':
        query = `
          SELECT 
            td.detail_id as "Detail ID", 
            td.transaction_id as "Transaction ID", 
            p.product_name as "Product", 
            td.quantity as "Quantity", 
            td.unit_price as "Unit Price", 
            td.subtotal as "Subtotal"
          FROM transaction_details td
          JOIN products p ON td.product_id = p.product_id
          ORDER BY td.${orderByClause} 
          LIMIT $1 OFFSET $2`;
        break;
      default:
        query = `SELECT * FROM ${table} ORDER BY ${orderByClause} LIMIT $1 OFFSET $2`;
    }
    
    const result = await pool.query(query, [limit, offset]);

    return NextResponse.json({
      data: result.rows,
      total,
      page,
      limit,
      table
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch table data' },
      { status: 500 }
    );
  }
}