-- SehatAI PostgreSQL Database Initialization Script

-- 1. Patients Table
CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INTEGER,
    status VARCHAR(50) DEFAULT 'Stable',
    condition VARCHAR(255),
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    item_name VARCHAR(100) NOT NULL,
    stock_level INTEGER DEFAULT 0,
    unit VARCHAR(20),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bed Registry Table
CREATE TABLE IF NOT EXISTS beds (
    id SERIAL PRIMARY KEY,
    ward VARCHAR(50) NOT NULL,
    bed_number VARCHAR(10) NOT NULL,
    status VARCHAR(50) DEFAULT 'Available'
);

-- 4. Audit & System Logs Table
CREATE TABLE IF NOT EXISTS system_logs (
    id SERIAL PRIMARY KEY,
    agent_name VARCHAR(50),
    action VARCHAR(100),
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data (Optional)
INSERT INTO patients (name, age, status, condition) VALUES 
('Eleanor Vance', 78, 'Critical', 'Arrhythmia'),
('Robert Ford', 82, 'Stable', 'Hypertension');

INSERT INTO inventory (item_name, stock_level, unit) VALUES 
('Oxygen', 500, 'Liters'),
('Amoxicillin', 200, 'Units');

INSERT INTO beds (ward, bed_number, status) VALUES 
('ICU', '101', 'Occupied'),
('ICU', '102', 'Available'),
('General Ward', 'G1', 'Available');
