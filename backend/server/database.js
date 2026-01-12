const Pool = require('pg').Pool;

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

const execute = async (createTblQuery, insertDataQuery) => {
    try {
        await pool.connect();
        await pool.query(createTblQuery);
        await pool.query(insertDataQuery);
        return true;
    } catch (error) {
        console.error(error.stack);
        return false;
    }
};

const createTables = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            address TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS wishlists (
            id SERIAL PRIMARY KEY,
            owner_id INTEGER NOT NULL
                REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS wishlist_items (
            id SERIAL PRIMARY KEY,
            wishlist_id INTEGER NOT NULL
                REFERENCES wishlists(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            price NUMERIC(10,2),
            description TEXT,
            link TEXT,
            image TEXT,
            purchased BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS wishlist_shared_users (
            id SERIAL PRIMARY KEY,
            wishlist_id INTEGER NOT NULL
                REFERENCES wishlists(id) ON DELETE CASCADE,
            user_id INTEGER NOT NULL
                REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE (wishlist_id, user_id)
        );

        CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
            item_id INTEGER NOT NULL UNIQUE
                REFERENCES wishlist_items(id) ON DELETE CASCADE,
            buyer_id INTEGER NOT NULL
                REFERENCES users(id) ON DELETE RESTRICT,
            message TEXT,
            paid BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT NOW()
        );
    `;

    await pool.query(query);
};

const insertTestData = async () => {
    const query = `
        INSERT INTO users (email, password, name, address)
        VALUES ('test@example.com', 'hashedpassword', 'Test User', 'Tartu, Estonia')
        ON CONFLICT (email) DO NOTHING;

        INSERT INTO wishlists (owner_id, title, description)
        SELECT id, 'Birthday Wishlist', 'Things I want for my birthday'
        FROM users
        WHERE email = 'test@example.com'
        ON CONFLICT DO NOTHING;

        INSERT INTO wishlist_items (wishlist_id, name, price, description, link, image)
        SELECT w.id, i.name, i.price, i.description, i.link, i.image
        FROM wishlists w,
        (VALUES
            ('Nintendo Switch', 299.99, 'A fun gaming console', 'https://example.com/switch', 'switch.jpg'),
            ('Headphones', 59.99, 'Noise cancelling', 'https://example.com/headphones', 'headphones.jpg')
        ) AS i(name, price, description, link, image)
        WHERE w.title = 'Birthday Wishlist'
        ON CONFLICT DO NOTHING;
    `;

    await pool.query(query);
};

(async () => {
    try {
        await createTables();
        await insertTestData();
        console.log("✅ Database initialized successfully");
    } catch (err) {
        console.error("❌ Database init error:", err);
    }
})();

module.exports = pool;