# DBMS Mini Project
## Members: 
### Aditya Suresh 231CS203
### Mohnish Hemanth Kumar 231CS235
### Nikhil Kottoli 231CS236
### Vishal 231CS263

# Banking System Database Schema

## Tables

### Customers Table
```sql
CREATE TABLE customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(15),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    hashed_pswd CHAR(128),
    user_salt CHAR(36)
);
```

### Accounts Table
```sql
CREATE TABLE accounts (
    account_id INT AUTO_INCREMENT PRIMARY KEY,
    account_number VARCHAR(20) NOT NULL UNIQUE,
    customer_id INT NOT NULL,
    account_type ENUM('savings', 'current') NOT NULL,
    balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    status ENUM('active', 'closed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    source_id INT,
    destination_id INT,
    transaction_type ENUM('deposit', 'withdraw', 'transfer') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_id) REFERENCES accounts(account_id),
    FOREIGN KEY (destination_id) REFERENCES accounts(account_id)
);
```

### Logs Table
```sql
CREATE TABLE logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    description TEXT,
    log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Functions

### Hash Password Function
```sql
DELIMITER ><
CREATE FUNCTION hash_pswd(pswd VARCHAR(255))
RETURNS VARCHAR(255) DETERMINISTIC
BEGIN
    DECLARE hashed_pswd CHAR(128);
    SET hashed_pswd = SHA2(pswd, 512);
    RETURN hashed_pswd;
END><
DELIMITER ;
```

### Validate Email Function
```sql
DELIMITER ><
CREATE FUNCTION validate_email(email VARCHAR(100))
RETURNS BOOLEAN DETERMINISTIC
BEGIN
    DECLARE is_valid BOOLEAN DEFAULT FALSE;
    IF email REGEXP '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' THEN
        SET is_valid = TRUE;
    END IF;
    RETURN is_valid;
END ><
DELIMITER ;
```

### Generate Account Number Function
```sql
DELIMITER ><
CREATE FUNCTION generate_acc_no()
RETURNS VARCHAR(20) DETERMINISTIC
BEGIN
    DECLARE acc_num VARCHAR(20);
    SET acc_num = CONCAT('icici-', FLOOR(RAND() * 1000000));
    RETURN acc_num;
END><
DELIMITER ;
```

## Procedures

### Sign Up User
```sql
DELIMITER ><
CREATE PROCEDURE signup_user(
    IN firstName VARCHAR(50),
    IN lastName VARCHAR(50),
    IN email_ VARCHAR(100),
    IN phone_ VARCHAR(15),
    IN address_ TEXT,
    IN pswd VARCHAR(255),
    OUT customerId INT
)
BEGIN
    DECLARE salt CHAR(36);
    DECLARE saltedPswd VARCHAR(291);
    DECLARE hashedPswd CHAR(128);
    IF EXISTS (SELECT 1 FROM customers WHERE email = email_) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Email already in use';
    END IF;
    IF LENGTH(pswd) < 8 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Password must be at least 8 characters long';
    END IF;
    SET salt = UUID();
    SET saltedPswd = CONCAT(salt, pswd);
    SET hashedPswd = hash_pswd(saltedPswd);
    INSERT INTO customers (first_name, last_name, email, phone, address, hashed_pswd, user_salt)
    VALUES (firstName, lastName, email_, phone_, address_, hashedPswd, salt);
    SELECT customer_id INTO customerId FROM customers WHERE email = email_;
END ><
DELIMITER ;
```

### Sign In User
```sql
delimiter ><
create procedure signin_user(
	in emaiL_ varchar(100),
	in pswd varchar(255))
begin
	declare hashed_input_pswd char(128);
	declare hashed_stored_pswd char(128);
	declare salt char(36);
	declare userId int;
	select customer_id,hashed_pswd,user_salt  into userId,hashed_stored_pswd,salt from customers where email = emaiL_;
	set hashed_input_pswd = hash_pswd(concat(salt,pswd));
	if hashed_stored_pswd is null or hashed_stored_pswd != hashed_input_pswd then
		signal sqlstate'45000' set message_text = 'Invalid email or password';
	else 
		select userId as customerId;
	end if;
end ><

delimiter ;
```

### Open Account
```sql
delimiter ><
create procedure open_account(
	in customerId int,
	in accountType enum('savings','current'),
	in initialDeposit decimal(15,2)
	)
begin
	declare acc_no varchar(20);
	declare accId int;
	set acc_no = generate_acc_no();
	insert into accounts (account_number, customer_id, account_type, balance) values (acc_no,customerId,accountType,initialDeposit);
	insert into logs (description)
    	values (concat('account opened for customer id: ', customerId,'with initial balance',initialDeposit));
	select account_id as accountId from accounts where customer_id = customerId order by created_at desc limit 1;
end ><
delimiter ;
```

### Deposit Money
```sql
DELIMITER ><
CREATE PROCEDURE deposit_money(
    IN accountId INT,
    IN amount DECIMAL(15,2)
)
BEGIN
    UPDATE accounts
    SET balance = balance + amount
    WHERE account_id = accountId;
    INSERT INTO transactions (source_id, destination_id, transaction_type, amount)
    VALUES (accountId, NULL, 'deposit', amount);
    INSERT INTO logs (description)
    VALUES (CONCAT('Deposited $', amount, ' into account ID: ', accountId));
END ><
DELIMITER ;
```

### Withdraw Money
```sql
DELIMITER ><
CREATE PROCEDURE withdraw_money(
    IN accountId INT,
    IN amount DECIMAL(15,2)
)
BEGIN
    DECLARE current_balance DECIMAL(15,2);
    SELECT balance INTO current_balance FROM accounts WHERE account_id = accountId;
    IF current_balance >= amount THEN
        UPDATE accounts
        SET balance = balance - amount
        WHERE account_id = accountId;
        INSERT INTO transactions (source_id, destination_id, transaction_type, amount)
        VALUES (NULL, accountId, 'withdraw', amount);
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient balance';
    END IF;
END ><
DELIMITER ;
```
### Withdraw Money
```sql
DELIMITER ><
CREATE PROCEDURE withdraw_money(
    IN accountId INT,
    IN amount DECIMAL(15,2)
)
BEGIN
    DECLARE current_balance DECIMAL(15,2);
    SELECT balance INTO current_balance FROM accounts WHERE account_id = accountId;
    IF current_balance >= amount THEN
        UPDATE accounts
        SET balance = balance - amount
        WHERE account_id = accountId;
        INSERT INTO transactions (source_id, destination_id, transaction_type, amount)
        VALUES (NULL, accountId, 'withdraw', amount);
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient balance';
    END IF;
END ><
DELIMITER ;
```

### Transfer Money
```sql
delimiter ><
create procedure transfer_money(
    in sourceId int,
    in destinationId int,
    in amounT decimal(15,2)
)
begin
    declare current_balance decimal(15,2);
    select balance into current_balance from accounts where account_id = sourceId;
    if current_balance >= amounT then
        update accounts
        set balance = balance - amounT
        where account_id = sourceId;
        
        update accounts
        set balance = balance + amounT
        where account_id = destinationId;

        insert into transactions (source_id,destination_id, transaction_type, amount)
        values (sourceId,destinationId, 'transfer', amounT);
        insert into logs (description)
        values (concat('Transfered $', amounT, ' from account id: ', sourceId,'To :',destinationId));
    else
        signal sqlstate '45000'
        set message_text = 'insufficient balance';
    end if;
end><
delimiter ;
```
This document outlines the SQL schema for a banking system, including table definitions, stored procedures, and functions.

