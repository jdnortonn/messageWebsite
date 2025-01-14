--

CREATE TABLE messages (
    id INT auto_increment PRIMARY KEY,
    user VARCHAR(50) NOT NULL,
    sentTo VARCHAR(50) NOT NULL,
    sentMessage TEXT(255),
    timeSent DATE
)

--
CREATE TABLE test (
    id INT auto_increment PRIMARY KEY,
    user VARCHAR(50) NOT NULL,
    sentTo VARCHAR(50) NOT NULL,
    sentMessage TEXT(255),
    timeSent DATE
)
--