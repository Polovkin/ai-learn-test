DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    age INT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    total_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
INSERT INTO users (name, email, city, age, created_at)
VALUES (
        'Ivan',
        'ivan@test.com',
        'Kyiv',
        25,
        '2026-01-01 10:00:00'
    ),
    (
        'Petro',
        'petro@test.com',
        'Lviv',
        31,
        '2026-01-02 11:00:00'
    ),
    (
        'Anna',
        'anna@test.com',
        'Kyiv',
        22,
        '2026-01-03 12:00:00'
    ),
    (
        'Olga',
        'olga@test.com',
        'Odesa',
        29,
        '2026-01-04 13:00:00'
    ),
    (
        'Max',
        'max@test.com',
        'Dnipro',
        35,
        '2026-01-05 14:00:00'
    );
INSERT INTO orders (user_id, total_amount, status, created_at)
VALUES (1, 1200.00, 'paid', '2026-01-10 10:00:00'),
    (1, 500.00, 'new', '2026-01-11 10:00:00'),
    (2, 2500.00, 'paid', '2026-01-12 10:00:00'),
    (3, 300.00, 'cancelled', '2026-01-13 10:00:00'),
    (3, 900.00, 'paid', '2026-01-14 10:00:00'),
    (5, 1500.00, 'new', '2026-01-15 10:00:00');