CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL,
    description TEXT,
    created_date DATE DEFAULT CURRENT_DATE
);

INSERT INTO categories (category_name, description) VALUES
('Electronics', 'Electronic devices and gadgets'),
('Clothing', 'Apparel and fashion items'),
('Beauty', 'Cosmetics and personal care products'),
('Home & Garden', 'Home improvement and garden supplies'),
('Sports', 'Sports equipment and accessories');

CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    category_id INTEGER REFERENCES categories(category_id),
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    description TEXT,
    created_date DATE DEFAULT CURRENT_DATE
);

INSERT INTO products (product_name, category_id, price, stock_quantity, description) VALUES
('Smartphone', 1, 699.99, 50, 'Latest model smartphone with advanced features'),
('Laptop', 1, 1299.99, 25, 'High-performance laptop for professionals'),
('Wireless Headphones', 1, 199.99, 100, 'Noise-cancelling wireless headphones'),
('Men''s T-Shirt', 2, 24.99, 200, 'Comfortable cotton t-shirt'),
('Women''s Jeans', 2, 79.99, 150, 'Premium denim jeans'),
('Running Shoes', 2, 129.99, 75, 'Professional running shoes'),
('Face Cream', 3, 39.99, 80, 'Anti-aging face cream'),
('Lipstick', 3, 19.99, 120, 'Long-lasting matte lipstick'),
('Perfume', 3, 89.99, 60, 'Premium fragrance');

CREATE TABLE customers (
    customer_id VARCHAR(8) PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(15),
    gender VARCHAR(10),
    age INTEGER,
    address TEXT,
    city VARCHAR(50),
    registration_date DATE DEFAULT CURRENT_DATE
);

INSERT INTO customers (customer_id, first_name, last_name, email, phone, gender, age, address, city) VALUES
('CUST001', 'John', 'Smith', 'john.smith@email.com', '555-0101', 'Male', 34, '123 Main St', 'New York'),
('CUST002', 'Sarah', 'Johnson', 'sarah.j@email.com', '555-0102', 'Female', 26, '456 Oak Ave', 'Los Angeles'),
('CUST003', 'Michael', 'Brown', 'mike.brown@email.com', '555-0103', 'Male', 50, '789 Pine St', 'Chicago'),
('CUST004', 'Emily', 'Davis', 'emily.davis@email.com', '555-0104', 'Female', 37, '321 Elm St', 'Houston'),
('CUST005', 'David', 'Wilson', 'david.w@email.com', '555-0105', 'Male', 30, '654 Maple Dr', 'Phoenix'),
('CUST006', 'Lisa', 'Martinez', 'lisa.m@email.com', '555-0106', 'Female', 45, '987 Cedar Ln', 'Philadelphia'),
('CUST007', 'James', 'Anderson', 'james.a@email.com', '555-0107', 'Male', 46, '147 Birch Rd', 'San Antonio'),
('CUST008', 'Jennifer', 'Taylor', 'jen.taylor@email.com', '555-0108', 'Female', 30, '258 Spruce St', 'San Diego'),
('CUST009', 'Robert', 'Thomas', 'robert.t@email.com', '555-0109', 'Male', 63, '369 Willow Ave', 'Dallas'),
('CUST010', 'Maria', 'Garcia', 'maria.g@email.com', '555-0110', 'Female', 52, '741 Ash St', 'San Jose');

CREATE TABLE transactions (
    transaction_id INTEGER PRIMARY KEY,
    customer_id VARCHAR(8) REFERENCES customers(customer_id),
    transaction_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20),
    status VARCHAR(20) DEFAULT 'Completed'
);

INSERT INTO transactions (transaction_id, customer_id, transaction_date, total_amount, payment_method, status) VALUES
(1, 'CUST001', '2023-11-24', 150.00, 'Credit Card', 'Completed'),
(2, 'CUST002', '2023-02-27', 1000.00, 'Debit Card', 'Completed'),
(3, 'CUST003', '2023-01-13', 30.00, 'Cash', 'Completed'),
(4, 'CUST004', '2023-05-21', 500.00, 'Credit Card', 'Completed'),
(5, 'CUST005', '2023-05-06', 100.00, 'PayPal', 'Completed'),
(6, 'CUST006', '2023-04-25', 30.00, 'Credit Card', 'Completed'),
(7, 'CUST007', '2023-03-13', 50.00, 'Cash', 'Completed'),
(8, 'CUST008', '2023-02-22', 100.00, 'Debit Card', 'Completed'),
(9, 'CUST009', '2023-12-13', 600.00, 'Credit Card', 'Completed'),
(10, 'CUST010', '2023-10-07', 200.00, 'PayPal', 'Completed');

CREATE TABLE transaction_details (
    detail_id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES transactions(transaction_id),
    product_id INTEGER REFERENCES products(product_id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    line_total DECIMAL(10,2) NOT NULL
);

INSERT INTO transaction_details (transaction_id, product_id, quantity, unit_price, line_total) VALUES
(1, 7, 3, 39.99, 119.97),
(1, 8, 1, 19.99, 19.99),
(2, 5, 2, 79.99, 159.98),
(2, 6, 1, 129.99, 129.99),
(3, 3, 1, 199.99, 199.99),
(4, 5, 1, 79.99, 79.99),
(5, 7, 2, 39.99, 79.98),
(6, 8, 1, 19.99, 19.99),
(7, 4, 2, 24.99, 49.98),
(8, 3, 1, 199.99, 199.99),
(9, 2, 1, 1299.99, 1299.99),
(10, 6, 2, 129.99, 259.98);

