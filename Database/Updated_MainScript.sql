-- Drop child tables first to avoid FK conflicts
DROP TABLE IF EXISTS compounddrugformulation;
DROP TABLE IF EXISTS vernacularnames;
DROP TABLE IF EXISTS singledrugformulations;
DROP TABLE IF EXISTS dosequantity;
DROP TABLE IF EXISTS action;
DROP TABLE IF EXISTS uses;
DROP TABLE IF EXISTS bookreference;
DROP TABLE IF EXISTS temperament;
DROP TABLE IF EXISTS source;
DROP TABLE IF EXISTS practitioner_applications;
DROP TABLE IF EXISTS users;
GO

CREATE TABLE users (
    userid INT IDENTITY(1,1) PRIMARY KEY,
	firstname VARCHAR (500),
    lastname VARCHAR(500) NULL,
    email VARCHAR(500),
    password VARCHAR(500) NOT NULL,  -- Store passwords securely (e.g., hashed)
    UserRole VARCHAR(500),  -- Role like 'admin', 'doctor', 'chemist'	
    city VARCHAR(500),
    country VARCHAR(500),
    postalCode VARCHAR(500),
	CONSTRAINT uq_users_email UNIQUE (email)
);
GO

-- Threads Table
CREATE TABLE threads (
	thread_id INT IDENTITY(1,1) PRIMARY KEY,
	userid INT NOT NULL,
	created_at DATETIME DEFAULT GETDATE(),
	FOREIGN KEY (userid) REFERENCES users(userid) ON DELETE CASCADE
);

CREATE TABLE practitioner_applications (
    application_id INT IDENTITY(1,1) PRIMARY KEY,
    userid INT NOT NULL,
    registration_number VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    application_date DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (userid) REFERENCES users(userid) ON DELETE CASCADE
);

-- UserCHAT Table
CREATE TABLE UserCHAT (
  chat_id INT IDENTITY(1,1) PRIMARY KEY,
  thread_id INT NOT NULL,
  userid INT NOT NULL,
  message TEXT,
  is_bot BIT DEFAULT 0,
  created_at DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (thread_id) REFERENCES threads(thread_id) ON DELETE CASCADE,
  FOREIGN KEY (userid) REFERENCES users(userid) ON DELETE NO ACTION
);


-- Create tables
CREATE TABLE action (
    actionid        INT IDENTITY(1,1) PRIMARY KEY,
    actionname      VARCHAR(MAX),
    actionname_urdu NVARCHAR(MAX)
);

CREATE TABLE bookreference (
    bookreference_id INT IDENTITY(1,1) PRIMARY KEY,
    bookname         VARCHAR(500) NOT NULL,
    bookauthor       VARCHAR(500) NOT NULL
);

CREATE TABLE dosequantity (
    dosequantityid INT IDENTITY(1,1) PRIMARY KEY,
    dose           NVARCHAR(255)
);

CREATE TABLE uses (
    usesid          INT IDENTITY(1,1) PRIMARY KEY,
    usesdescription VARCHAR(MAX)
);

CREATE TABLE source (
    sourceid   INT IDENTITY(1,1) PRIMARY KEY,
    sourcename VARCHAR(500)
);

CREATE TABLE temperament (
    temperamentid INT IDENTITY(1,1) PRIMARY KEY,
    typename      VARCHAR(500) NOT NULL,
    degree        DECIMAL(10, 5)
);

CREATE TABLE singledrugformulations (
    drugid             INT IDENTITY(1,1) PRIMARY KEY,
    originalname       VARCHAR(500),
    temperamentid      INT,
    botanicalname      VARCHAR(500),
    botanicalname_urdu NVARCHAR(500) NULL,
    vernacularname	   VARCHAR(500),
    sourceid		   INT,
	constituents       NVARCHAR(500),
    actionid           INT,
    usesid             INT,
    bookreference_id   INT,
	userid INT,  -- User ID added here
    FOREIGN KEY (temperamentid) REFERENCES temperament(temperamentid),
    FOREIGN KEY (sourceid) REFERENCES source(sourceid),
    FOREIGN KEY (actionid) REFERENCES action(actionid),
    FOREIGN KEY (usesid) REFERENCES uses(usesid),
	FOREIGN KEY (bookreference_id) REFERENCES bookreference(bookreference_id),
	FOREIGN KEY (userid) REFERENCES users(userid)  -- Foreign key reference
);

CREATE TABLE vernacularnames (
    vernacularname_id INT IDENTITY(1,1) PRIMARY KEY,
    drugid INT,
    name NVARCHAR(500),
    language VARCHAR(500),  -- e.g., 'English', 'Hindi', 'Pashto'
	FOREIGN KEY (drugid) REFERENCES singledrugformulations(drugid) ON DELETE CASCADE
);

CREATE TABLE compounddrugformulation (
    compounddrugid            INT IDENTITY(1,1) PRIMARY KEY,
    compounddrugname          VARCHAR(500),
    description               VARCHAR(MAX),
    chiefingredient           VARCHAR(500),
	Ingredients				  VARCHAR(MAX),
    preparation               VARCHAR(MAX),
    actionid                  INT,
    usesid                    INT,
    dosequantityid            INT,
    bookreference_id          INT,
	userid INT,  -- User ID added here
    FOREIGN KEY (dosequantityid) REFERENCES dosequantity(dosequantityid),
    FOREIGN KEY (actionid) REFERENCES action(actionid),
    FOREIGN KEY (usesid) REFERENCES uses(usesid),
    FOREIGN KEY (bookreference_id) REFERENCES bookreference(bookreference_id),
	FOREIGN KEY (userid) REFERENCES users(userid)  -- Foreign key reference
);

