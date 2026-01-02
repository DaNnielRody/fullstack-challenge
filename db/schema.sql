USE `main`;

CREATE TABLE posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    author_id INT NOT NULL,
    post_text VARCHAR(200),
    FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100),
    user_email VARCHAR(100) NOT NULL,
    user_password VARCHAR(200) NOT NULL
);

ALTER USER 'root'@'localhost' IDENTIFIED WITH caching_sha2_password BY 'root';

ALTER USER 'root' IDENTIFIED WITH caching_sha2_password BY 'root';

FLUSH PRIVILEGES;

