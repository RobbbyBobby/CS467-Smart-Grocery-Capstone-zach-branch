-- Drop and recreate the database 
DROP DATABASE IF EXISTS smartgrocery;
CREATE DATABASE smartgrocery;
USE smartgrocery;

-- Disable foreign key checks for initial creation
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------
-- Users Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
    `userId` INT NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(45) NOT NULL,
    `email` VARCHAR(45) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NULL,
    PRIMARY KEY (`userId`),
    UNIQUE (`username`),
    UNIQUE (`email`)
);

-- -----------------------------------------------------
-- Food Category Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `foodCategory` (
    `categoryId` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(45) NOT NULL,
    PRIMARY KEY (`categoryId`)
);

-- -----------------------------------------------------
-- Items Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `items` (
    `itemId` INT NOT NULL AUTO_INCREMENT,
    `userId` INT NOT NULL,
    `itemName` VARCHAR(45) NOT NULL,
    `itemQuantity` DECIMAL(10,2) NOT NULL,
    `categoryId` INT NULL,
    `barcode` VARCHAR(45) NULL,
    `expiryDate` DATE NULL,
    `state` ENUM('fresh', 'nearing_expiration', 'expired') NOT NULL DEFAULT 'fresh',
    `units` VARCHAR(45) NOT NULL,
    `purchaseDate` DATETIME NULL,
    `createdAt` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`itemId`),
    CONSTRAINT `fk_items_users` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE CASCADE,
    CONSTRAINT `fk_items_category` FOREIGN KEY (`categoryId`) REFERENCES `foodCategory`(`categoryId`) ON DELETE SET NULL
);

-- -----------------------------------------------------
-- Recipes Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `recipes` (
    `recipeId` INT NOT NULL AUTO_INCREMENT,
    `userId` INT NOT NULL,
    `sourceDomain` VARCHAR(45) NULL,
    `sourceURL` TEXT NULL,
    `createdAt` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`recipeId`),
    CONSTRAINT `fk_recipes_users` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Pantry History Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `itemHistory` (
    `histId` INT NOT NULL AUTO_INCREMENT,
    `userId` INT NOT NULL,
    `itemId` INT NOT NULL,
    `action` ENUM('added', 'used', 'expired', 'restocked') NOT NULL,
    `quantityChange` INT NULL,
    `actionDate` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`histId`),
    CONSTRAINT `fk_itemHistory_users` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE CASCADE,
    CONSTRAINT `fk_itemHistory_items` FOREIGN KEY (`itemId`) REFERENCES `items`(`itemId`) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Re-enable foreign key checks
-- -----------------------------------------------------
SET FOREIGN_KEY_CHECKS = 1;

-- Users
INSERT INTO users (username, email, password) VALUES
('alecC', 'alec@example.com', '$2a$12$jagZ00KQDQ/q5fpWEb7YsORDmsOtcKy1PyjG2ST9Ysagzs0IxlCYe'),
('natalieD', 'natalie@example.com', '$2a$12$jagZ00KQDQ/q5fpWEb7YsORDmsOtcKy1PyjG2ST9Ysagzs0IxlCYe'),
('zachJ', 'zach@example.com', '$2a$12$jagZ00KQDQ/q5fpWEb7YsORDmsOtcKy1PyjG2ST9Ysagzs0IxlCYe'),
('anishR', 'anish@example.com', '$2a$12$jagZ00KQDQ/q5fpWEb7YsORDmsOtcKy1PyjG2ST9Ysagzs0IxlCYe'),
('robertK', 'robert@example.com', '$2a$12$jagZ00KQDQ/q5fpWEb7YsORDmsOtcKy1PyjG2ST9Ysagzs0IxlCYe');

-- Food Categories
INSERT INTO foodCategory (name) VALUES
('Fruit'),
('Vegetable'),
('Meat'),
('Dairy'),
('Snack'),
('Pantry'),
('Frozen'),
('Beverage');

-- Items
INSERT INTO items (userId, itemName, itemQuantity, categoryId, barcode, expiryDate, units, state, purchaseDate) VALUES
(1, 'Bananas', 6, 1, '123456789012', '2025-12-01', 'pcs', 'fresh', '2025-11-18 00:00:00'),
(1, 'Chicken Breast', 2, 3, '555555555555', '2025-11-28', 'lbs', 'nearing_expiration', '2025-11-18 00:00:00'),
(2, 'Greek Yogurt', 3, 4, '987654321098', '2025-11-25', 'tub', 'fresh', '2025-11-15 00:00:00'),
(3, 'Doritos Chips', 1, 5, NULL, NULL, 'bag', 'fresh', '2025-11-19 00:00:00'),
(4, 'Frozen Peas', 2, 7, NULL, '2026-01-15', 'bag', 'fresh', '2025-11-02 00:00:00'),
(5, 'Orange Juice', 1, 8, NULL, '2025-12-10', 'litre', 'expired', '2025-11-01 00:00:00');

-- Recipes
INSERT INTO recipes (userId, sourceDomain, sourceURL) VALUES
(1, 'allrecipes.com', 'https://allrecipes.com/banana-bread'),
(2, 'tasteofhome.com', 'https://tasteofhome.com/greek-yogurt-parfait'),
(3, 'delish.com', 'https://delish.com/best-nacho-recipe');

-- Pantry History
INSERT INTO itemHistory (userId, itemId, action, quantityChange) VALUES
(1, 1, 'added', 6),
(1, 1, 'used', 2),
(1, 2, 'added', 2),
(1, 2, 'used', 1)