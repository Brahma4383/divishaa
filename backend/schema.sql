-- Active: 1785166015310@@127.0.0.1@3306@divishaa_couture
-- =====================================================================
-- Divishaa.couture — Full Database Schema (MySQL)
-- =====================================================================
-- Notes on approach (read this before the tables):
--
-- 1. ROLE-BASED ACCESS
--    One single `users` table, with a `role` column: 'customer', 'vendor',
--    or 'admin'. There is no separate "vendors" or "admins" table — that
--    would just duplicate columns and force joins everywhere for no real
--    benefit at this scale.
--    - A customer can browse/buy.
--    - A vendor can manage their own products (checked via
--      products.vendor_id = logged-in user's id).
--    - An admin can do everything a vendor can (approve/reject any
--      product, not just their own) AND everything a customer can.
--      This is enforced in your backend/API layer, e.g.:
--        if (user.role === 'admin' || product.vendor_id === user.id) { ... }
--      No extra schema is needed for that — it's just an application-level
--      permission check using the same `role` column.
--
-- 2. PRODUCT IMAGES
--    `products.image` holds the main/cover photo (a URL or file path).
--    `product_images` is an optional table for extra gallery photos per
--    product. Actual image FILES are not stored in MySQL — they live on
--    disk or cloud storage (e.g. local /uploads folder, or S3/Cloudinary),
--    and these columns just store the resulting URL/path string.
--
-- 3. NO CONTACT TABLE
--    The Contact page sends an email directly (e.g. via Nodemailer/SMTP
--    or a mail API) — nothing about it is persisted in the database.
--
-- 4. KEEPING IT SIMPLE
--    Plain auto-increment integer IDs, straightforward foreign keys,
--    no unnecessary junction tables. Sizes/colors are stored as JSON on
--    the product row instead of extra lookup tables, since they're just
--    small option lists per product, not shared/reusable data.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS divishaa_couture;
USE divishaa_couture;

-- ---------------------------------------------------------------------
-- USERS  (customers, vendors, and admin all live here — see note #1)
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    first_name    VARCHAR(150)  NOT NULL,
    last_name     VARCHAR(150)  NOT NULL,
    email         VARCHAR(150)  NOT NULL UNIQUE,
    password      VARCHAR(128)  NOT NULL,
    role          ENUM('customer', 'vendor', 'admin') NOT NULL DEFAULT 'customer',
    phone         VARCHAR(20),
    created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- Customers and vendors are unlimited — no cap needed, a plain INSERT just
-- works. Admins are capped at 4 total. MySQL's CHECK constraints can't
-- count existing rows (they only validate a single row in isolation), so
-- enforcing "at most N admins" needs a trigger instead. This is the
-- database-level safety net; your signup/admin-creation form should also
-- check this and show a friendly error before it ever reaches the DB.

DELIMITER $$

CREATE TRIGGER trg_limit_admin_insert
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    DECLARE admin_count INT;
    IF NEW.role = 'admin' THEN
        SELECT COUNT(*) INTO admin_count FROM users WHERE role = 'admin';
        IF admin_count >= 4 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Maximum number of admin accounts (4) already exists.';
        END IF;
    END IF;
END$$

-- Also covers promoting an existing customer/vendor to admin later
-- (e.g. an admin panel action), not just brand-new signups.
CREATE TRIGGER trg_limit_admin_update
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    DECLARE admin_count INT;
    IF NEW.role = 'admin' AND OLD.role <> 'admin' THEN
        SELECT COUNT(*) INTO admin_count FROM users WHERE role = 'admin';
        IF admin_count >= 4 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Maximum number of admin accounts (4) already exists.';
        END IF;
    END IF;
END$$

DELIMITER ;

-- ---------------------------------------------------------------------
-- CATEGORIES  (Women, Men, Kids, Shoes, Accessories, Bags...)
-- Kept as a real table (not hardcoded in frontend) so it's a dynamic,
-- admin-editable list.
-- ---------------------------------------------------------------------
CREATE TABLE categories (
    id    INT AUTO_INCREMENT PRIMARY KEY,
    name  VARCHAR(100) NOT NULL,
    slug  VARCHAR(100) NOT NULL UNIQUE,
    image VARCHAR(500)
);

-- ---------------------------------------------------------------------
-- PRODUCTS  (added by a vendor, or by an admin on a vendor's behalf)
-- ---------------------------------------------------------------------
CREATE TABLE products (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id        INT NOT NULL,
    category_id      INT NOT NULL,
    name             VARCHAR(200)  NOT NULL,
    brand            VARCHAR(150),
    description      TEXT,
    price            DECIMAL(10,2) NOT NULL,
    original_price   DECIMAL(10,2),                 -- optional, for a discount badge
    stock            INT NOT NULL DEFAULT 0,
    sizes            JSON,                           -- e.g. ["S","M","L"]
    colors           JSON,                           -- e.g. ["Indigo","Rust"]
    image            VARCHAR(500),                   -- main/cover image URL
    status           ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (vendor_id)   REFERENCES users(id)      ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id)  ON DELETE RESTRICT
);

-- ---------------------------------------------------------------------
-- PRODUCT IMAGES  (optional extra gallery photos beyond the main image)
-- ---------------------------------------------------------------------
CREATE TABLE product_images (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url  VARCHAR(500) NOT NULL,
    sort_order INT DEFAULT 0,

    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- REVIEWS  (a customer reviewing a product)
-- ---------------------------------------------------------------------
CREATE TABLE reviews (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id    INT NOT NULL,
    rating     TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment    TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)    REFERENCES users(id)     ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- WISHLIST  (simple user ↔ product join table)
-- ---------------------------------------------------------------------
CREATE TABLE wishlist_items (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (user_id, product_id),
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- CART ITEMS  (one row per user+product+variant; no separate "carts" table needed)
-- ---------------------------------------------------------------------
CREATE TABLE cart_items (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    product_id INT NOT NULL,
    quantity   INT NOT NULL DEFAULT 1,
    size       VARCHAR(20),
    color      VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- ADDRESSES  (a customer's saved shipping addresses)
-- ---------------------------------------------------------------------
CREATE TABLE addresses (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT NOT NULL,
    full_name     VARCHAR(150) NOT NULL,
    phone         VARCHAR(20)  NOT NULL,
    address_line  VARCHAR(255) NOT NULL,
    city          VARCHAR(100) NOT NULL,
    state         VARCHAR(100) NOT NULL,
    pincode       VARCHAR(12)  NOT NULL,
    is_default    BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- ORDERS  (a completed checkout)
-- ---------------------------------------------------------------------
CREATE TABLE orders (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    address_id      INT,
    total_amount    DECIMAL(10,2) NOT NULL,
    payment_method  VARCHAR(50),
    status          ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)    REFERENCES users(id)     ON DELETE CASCADE,
    FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE SET NULL
);

-- ---------------------------------------------------------------------
-- ORDER ITEMS  (each product within an order — vendor_id is duplicated
-- here so a vendor can query "which of my products have sold" directly,
-- without joining through products in case a product is later deleted)
-- ---------------------------------------------------------------------
CREATE TABLE order_items (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    order_id    INT NOT NULL,
    product_id  INT NOT NULL,
    vendor_id   INT NOT NULL,
    quantity    INT NOT NULL,
    price       DECIMAL(10,2) NOT NULL,   -- price at time of purchase
    size        VARCHAR(20),
    color       VARCHAR(50),

    FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    FOREIGN KEY (vendor_id)  REFERENCES users(id)    ON DELETE RESTRICT
);

-- ---------------------------------------------------------------------
-- RETURN REQUESTS  (matches the Returns page's "Start a Return" form)
-- ---------------------------------------------------------------------
CREATE TABLE return_requests (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    order_id     INT NOT NULL,
    user_id      INT NOT NULL,
    reason       VARCHAR(255) NOT NULL,
    details      TEXT,
    status       ENUM('pending', 'approved', 'rejected', 'completed') NOT NULL DEFAULT 'pending',
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- BLOG POSTS  (so the Blog page can be admin-managed instead of hardcoded)
-- ---------------------------------------------------------------------
CREATE TABLE blog_posts (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    title         VARCHAR(255) NOT NULL,
    slug          VARCHAR(255) NOT NULL UNIQUE,
    category      VARCHAR(100),
    excerpt       VARCHAR(500),
    content       TEXT,
    image         VARCHAR(500),
    author_name   VARCHAR(150),
    is_featured   BOOLEAN DEFAULT FALSE,
    published_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- JOB OPENINGS  (for the Careers page)
-- ---------------------------------------------------------------------
CREATE TABLE job_openings (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(200) NOT NULL,
    department  VARCHAR(100) NOT NULL,
    location    VARCHAR(150) NOT NULL,
    type        VARCHAR(50)  NOT NULL,   -- e.g. "Full-time", "Internship"
    description TEXT,
    is_active   BOOLEAN DEFAULT TRUE
);

-- ---------------------------------------------------------------------
-- FAQ ITEMS  (for the FAQ page)
-- ---------------------------------------------------------------------
CREATE TABLE faq_items (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    category   VARCHAR(100) NOT NULL,
    question   VARCHAR(255) NOT NULL,
    answer     TEXT NOT NULL,
    sort_order INT DEFAULT 0
);