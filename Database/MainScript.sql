-- Drop tables if exist
DROP TABLE IF EXISTS compounddrugformulation;
DROP TABLE IF EXISTS singledrugformulations;
DROP TABLE IF EXISTS root_components;
DROP TABLE IF EXISTS dosequantity;
DROP TABLE IF EXISTS actions;
DROP TABLE IF EXISTS uses;
DROP TABLE IF EXISTS temparament;
DROP TABLE IF EXISTS totalavailableconstituents;
DROP TABLE IF EXISTS source;
DROP TABLE IF EXISTS users;
GO

-- Create User table
CREATE TABLE users (
    userid INT IDENTITY(1,1) PRIMARY KEY,
	firstname VARCHAR (50),
    lastname VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    password VARCHAR(100) NOT NULL,  -- Store passwords securely (e.g., hashed)
    UserRole VARCHAR(50),  -- Role like 'admin', 'doctor', 'chemist'	
    city VARCHAR(50),
    country VARCHAR(50),
    postalCode VARCHAR(50)
);
GO

-- Table: actions
CREATE TABLE actions (
    actionid INT IDENTITY(1,1) PRIMARY KEY,
    actionname VARCHAR(100)
);
GO

-- Table: dosequantity
CREATE TABLE dosequantity (
    dosequantityid INT IDENTITY(1,1) PRIMARY KEY,
    dosequantity INT,
    quantityunit VARCHAR(50)
);
GO

-- Table: source
CREATE TABLE source (
    sourceid INT IDENTITY(1,1) PRIMARY KEY,
    sourcename VARCHAR(50),
    sourcetype VARCHAR(50)
);
GO

-- Table: temparament
CREATE TABLE temparament (
    temperamentid INT IDENTITY(1,1) PRIMARY KEY,
    typename VARCHAR(50) NOT NULL,
    degree DECIMAL(5, 2) NOT NULL
);
GO

-- Table: totalavailableconstituents
CREATE TABLE totalavailableconstituents (
    constituentid INT IDENTITY(1,1) PRIMARY KEY,
    constituentname VARCHAR(50)
);
GO

-- Table: uses
CREATE TABLE uses (
    usesid INT IDENTITY(1,1) PRIMARY KEY,
    usesdescription VARCHAR(200)
);
GO

-- Table: root_components
CREATE TABLE root_components (
    root_comid INT IDENTITY(1,1) PRIMARY KEY,
    root_comname VARCHAR(50),
    source_sourceid INT,
    FOREIGN KEY (source_sourceid) REFERENCES source(sourceid)
);
GO

-- Table: singledrugformulations
CREATE TABLE singledrugformulations (
    drugid INT IDENTITY(1,1) PRIMARY KEY,
    originalname VARCHAR(50),
    vernacularnames VARCHAR(50),
    temperamentid INT,
    usesid INT,
    actionid INT,
    root_comid INT,
    constituentid INT,
    userid INT,  -- User ID added here
    FOREIGN KEY (temperamentid) REFERENCES temparament(temperamentid),
    FOREIGN KEY (usesid) REFERENCES uses(usesid),
    FOREIGN KEY (actionid) REFERENCES actions(actionid),
    FOREIGN KEY (root_comid) REFERENCES root_components(root_comid),
    FOREIGN KEY (constituentid) REFERENCES totalavailableconstituents(constituentid),
    FOREIGN KEY (userid) REFERENCES users(userid)  -- Foreign key reference
);
GO

-- Table: compounddrugformulation
CREATE TABLE compounddrugformulation (
    compounddrugid INT IDENTITY(1,1) PRIMARY KEY,
    description VARCHAR(100),
    chiefingredient VARCHAR(50),
    dosequantityid INT,
    preparation VARCHAR(100),
    actionid INT,
    usesid INT,
    singledrugformid INT,
    userid INT,  -- User ID added here
    FOREIGN KEY (dosequantityid) REFERENCES dosequantity(dosequantityid),
    FOREIGN KEY (actionid) REFERENCES actions(actionid),
    FOREIGN KEY (usesid) REFERENCES uses(usesid),
    FOREIGN KEY (singledrugformid) REFERENCES singledrugformulations(drugid),
    FOREIGN KEY (userid) REFERENCES users(userid)  -- Foreign key reference
);
GO
