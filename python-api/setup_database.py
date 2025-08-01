#!/usr/bin/env python3
"""
Database setup script to create tables for the DBMS Mini Project
"""

import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import bcrypt

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Database configuration
DB_CONFIG = {
    'host': os.getenv('POSTGRES_HOST', 'localhost'),
    'port': os.getenv('POSTGRES_PORT', '5432'),
    'user': os.getenv('POSTGRES_USER', 'postgres'),
    'password': os.getenv('POSTGRES_PASSWORD', 'password'),
    'database': os.getenv('POSTGRES_DATABASE', 'dbms_mini_2')
}

def create_connection():
    """Create database connection"""
    try:
        connection = psycopg2.connect(**DB_CONFIG)
        connection.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        return connection
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

def create_tables(connection):
    """Create all required tables"""
    cursor = connection.cursor()
    
    # Create users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    # Create index on email
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);")
    
    # Create categories table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS categories (
            category_id SERIAL PRIMARY KEY,
            category_name VARCHAR(100) NOT NULL UNIQUE,
            description TEXT,
            created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    # Create products table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            product_id SERIAL PRIMARY KEY,
            product_name VARCHAR(255) NOT NULL,
            category_id INTEGER REFERENCES categories(category_id),
            price DECIMAL(10,2) NOT NULL,
            stock_quantity INTEGER DEFAULT 0,
            description TEXT,
            created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    # Create customers table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS customers (
            customer_id SERIAL PRIMARY KEY,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            email VARCHAR(255) UNIQUE,
            phone VARCHAR(20),
            gender VARCHAR(10),
            age INTEGER,
            address TEXT,
            city VARCHAR(100),
            registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    # Create transactions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            transaction_id SERIAL PRIMARY KEY,
            customer_id INTEGER REFERENCES customers(customer_id),
            transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            total_amount DECIMAL(10,2) NOT NULL,
            payment_method VARCHAR(50),
            status VARCHAR(20) DEFAULT 'completed'
        );
    """)
    
    # Create transaction_details table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS transaction_details (
            detail_id SERIAL PRIMARY KEY,
            transaction_id INTEGER REFERENCES transactions(transaction_id),
            product_id INTEGER REFERENCES products(product_id),
            quantity INTEGER NOT NULL,
            unit_price DECIMAL(10,2) NOT NULL,
            line_total DECIMAL(10,2) NOT NULL
        );
    """)
    
    print("✅ All tables created successfully!")

def insert_sample_data(connection):
    """Insert sample data"""
    cursor = connection.cursor()
    
    # Insert categories
    cursor.execute("""
        INSERT INTO categories (category_name, description) VALUES 
        ('Electronics', 'Electronic devices and gadgets'),
        ('Clothing', 'Apparel and fashion items'),
        ('Beauty', 'Cosmetics and personal care'),
        ('Home & Garden', 'Home improvement and garden supplies'),
        ('Sports', 'Sports equipment and accessories')
        ON CONFLICT (category_name) DO NOTHING;
    """)
    
    # Insert products
    cursor.execute("""
        INSERT INTO products (product_name, category_id, price, stock_quantity, description) 
        SELECT 'iPhone 15 Pro', 1, 999.99, 50, 'Latest Apple smartphone'
        WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_name = 'iPhone 15 Pro');
        
        INSERT INTO products (product_name, category_id, price, stock_quantity, description) 
        SELECT 'MacBook Air M2', 1, 1199.99, 25, 'Apple laptop with M2 chip'
        WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_name = 'MacBook Air M2');
        
        INSERT INTO products (product_name, category_id, price, stock_quantity, description) 
        SELECT 'Sony Headphones', 1, 299.99, 100, 'Wireless noise-canceling headphones'
        WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_name = 'Sony Headphones');
        
        INSERT INTO products (product_name, category_id, price, stock_quantity, description) 
        SELECT 'Cotton T-Shirt', 2, 29.99, 200, 'Comfortable cotton t-shirt'
        WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_name = 'Cotton T-Shirt');
        
        INSERT INTO products (product_name, category_id, price, stock_quantity, description) 
        SELECT 'Denim Jeans', 2, 79.99, 150, 'Classic blue denim jeans'
        WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_name = 'Denim Jeans');
    """)
    
    # Insert customers
    cursor.execute("""
        INSERT INTO customers (first_name, last_name, email, phone, gender, age, address, city) VALUES 
        ('John', 'Doe', 'john.doe@email.com', '555-0101', 'Male', 28, '123 Main St', 'New York'),
        ('Jane', 'Smith', 'jane.smith@email.com', '555-0102', 'Female', 32, '456 Oak Ave', 'Los Angeles'),
        ('Mike', 'Johnson', 'mike.j@email.com', '555-0103', 'Male', 25, '789 Pine Rd', 'Chicago'),
        ('Sarah', 'Wilson', 'sarah.w@email.com', '555-0104', 'Female', 29, '321 Elm St', 'Houston'),
        ('David', 'Brown', 'david.b@email.com', '555-0105', 'Male', 35, '654 Maple Dr', 'Phoenix')
        ON CONFLICT (email) DO NOTHING;
    """)
    
    # Insert sample transactions
    cursor.execute("""
        INSERT INTO transactions (customer_id, total_amount, payment_method) VALUES 
        (1, 1299.98, 'Credit Card'),
        (2, 159.98, 'Debit Card'),
        (3, 24.99, 'Cash'),
        (4, 179.97, 'PayPal'),
        (5, 1199.99, 'Credit Card')
        ON CONFLICT DO NOTHING;
    """)
    
    # Insert admin user with hashed password
    hashed_password = bcrypt.hashpw(b'password123', bcrypt.gensalt()).decode('utf-8')
    cursor.execute("""
        INSERT INTO users (email, password) VALUES (%s, %s)
        ON CONFLICT (email) DO NOTHING;
    """, ('admin@example.com', hashed_password))
    
    print("✅ Sample data inserted successfully!")

def main():
    """Main setup function"""
    print("🚀 Setting up DBMS Mini Project database...")
    
    # Create connection
    connection = create_connection()
    if not connection:
        print("❌ Failed to connect to database")
        return False
    
    try:
        # Create tables
        create_tables(connection)
        
        # Insert sample data
        insert_sample_data(connection)
        
        print("🎉 Database setup completed successfully!")
        print(f"📊 Connected to database: {DB_CONFIG['database']}")
        print(f"🏠 Host: {DB_CONFIG['host']}:{DB_CONFIG['port']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        return False
    finally:
        connection.close()

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
