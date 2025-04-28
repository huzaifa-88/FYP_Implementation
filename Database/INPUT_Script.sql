INSERT INTO users (firstname, lastname, email, password, UserRole, city, country, postalCode)
VALUES 
('Ali', 'Khan', 'ali.khan@example.com', 'Password123', 'admin', 'Lahore', 'Pakistan', '54000'),

('Sara', 'Ahmed', 'sara.ahmed@example.com', 'SecurePass456', 'doctor', 'Karachi', 'Pakistan', '74000'),

('John', 'Doe', 'john.doe@example.com', 'MyPass789', 'chemist', 'Islamabad', 'Pakistan', '44000'),

('Ayesha', 'Malik', 'ayesha.malik@example.com', 'HelloWorld321', 'admin', 'Faisalabad', 'Pakistan', '38000');


INSERT INTO actions (actionname) VALUES
('Blood Purifier'),
('Anti-inflammatory'),
('Digestive'),
('Diuretic');

INSERT INTO dosequantity (dosequantity, quantityunit) VALUES
(5, 'grams'),
(10, 'ml'),
(2, 'tablets'),
(1, 'teaspoon');


INSERT INTO source (sourcename, sourcetype) VALUES
('Aloe Vera Plant', 'Herb'),
('Ginger Root', 'Root'),
('Mint Leaves', 'Leaf');

INSERT INTO temparament (typename, degree) VALUES
('Hot & Dry', 2.0),
('Cold & Wet', 1.5),
('Hot & Wet', 2.5);

INSERT INTO totalavailableconstituents (constituentname) VALUES
('Aloin'),
('Gingerol'),
('Menthol');

INSERT INTO uses (usesdescription) VALUES
('Used to treat constipation and improve digestion'),
('Helps relieve nausea and muscle pain'),
('Effective for digestive issues and headaches');

-- Assuming sourceid 1 = Aloe Vera, 2 = Ginger, etc.
INSERT INTO root_components (root_comname, source_sourceid) VALUES
('Aloe Vera Extract', 1),
('Ginger Powder', 2),
('Mint Oil', 3);

-- Assume IDs based on order of insertion above
INSERT INTO singledrugformulations (
    originalname, vernacularnames, temperamentid, usesid, actionid,
    root_comid, constituentid
) VALUES
('Aloe Formulation', 'Ghritkumari', 1, 1, 1, 1, 1),
('Ginger Formulation', 'Adrak', 3, 2, 2, 2, 2),
('Mint Formulation', 'Pudina', 2, 3, 3, 3, 3);

-- Again, assuming matching foreign key values from above
INSERT INTO compounddrugformulation (
    description, chiefingredient, dosequantityid, preparation,
    actionid, usesid, singledrugformid
) VALUES
('Herbal compound for digestion', 'Ginger', 2, 'Boil in water and drink twice daily', 2, 2, 2),
('Cooling compound for headaches', 'Mint', 1, 'Crush and apply on forehead', 3, 3, 3);



select * from compounddrugformulation

select * from users