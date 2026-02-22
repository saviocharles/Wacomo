CREATE DATABASE IF NOT EXISTS wacomo;
USE wacomo;

-- Users Table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'USER', 'VIEWER') DEFAULT 'USER',
    phone VARCHAR(20),
    manager_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Locations Master
CREATE TABLE locations (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    state VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Commodity Master
CREATE TABLE commodity_master (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    unit VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- WhatsApp Groups
CREATE TABLE whatsapp_groups (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    group_id VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Commodities (Captured Messages)
CREATE TABLE commodities (
    id VARCHAR(36) PRIMARY KEY,
    raw_message TEXT NOT NULL,
    message_id VARCHAR(255),
    sender VARCHAR(255),
    group_name VARCHAR(255),
    parsed_name VARCHAR(255),
    location VARCHAR(255),
    rate DECIMAL(15, 2),
    quantity DECIMAL(15, 2),
    unit VARCHAR(50),
    status ENUM('PENDING', 'ASSIGNED', 'COMPLETED', 'UNIDENTIFIED') DEFAULT 'PENDING',
    priority ENUM('HIGH', 'MEDIUM', 'LOW') DEFAULT 'MEDIUM',
    deadline DATETIME,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Assignments
CREATE TABLE assignments (
    id VARCHAR(36) PRIMARY KEY,
    commodity_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    status ENUM('ASSIGNED', 'WORK_IN_PROGRESS', 'COMPLETED') DEFAULT 'ASSIGNED',
    user_remarks TEXT,
    updated_rate DECIMAL(15, 2),
    updated_quantity DECIMAL(15, 2),
    source_location VARCHAR(255),
    deadline DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (commodity_id) REFERENCES commodities(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Audit Logs
CREATE TABLE audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    commodity_id VARCHAR(36),
    assignment_id VARCHAR(36),
    action VARCHAR(255) NOT NULL, -- CREATED, ASSIGNED, STATUS_CHANGED, etc.
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (commodity_id) REFERENCES commodities(id) ON DELETE SET NULL,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE SET NULL
);
