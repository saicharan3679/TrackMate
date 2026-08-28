# Database Setup (MySQL — 100% free, no license required)

This project uses **MySQL Community Server**, which is free and open source with no license fees, ever — nothing here requires a paid account, subscription, or credit card.

## 1. Install MySQL Community Server

Download from [dev.mysql.com/downloads/mysql](https://dev.mysql.com/downloads/mysql/) (pick "MySQL Community Server", not the commercial editions) and install it locally. During setup, set a root password and remember it.

## 2. Create the database and tables

Open **MySQL Workbench** (installed alongside the server) or the `mysql` command line, and run:

```sql
CREATE DATABASE reservation;
USE reservation;

CREATE TABLE customer (
  mailid  VARCHAR(40) PRIMARY KEY,
  pword   VARCHAR(20) NOT NULL,
  fname   VARCHAR(20) NOT NULL,
  lname   VARCHAR(20),
  addr    VARCHAR(100),
  phno    BIGINT NOT NULL
);

CREATE TABLE admin (
  mailid  VARCHAR(40) PRIMARY KEY,
  pword   VARCHAR(20) NOT NULL,
  fname   VARCHAR(20) NOT NULL,
  lname   VARCHAR(20),
  addr    VARCHAR(100),
  phno    BIGINT NOT NULL
);

CREATE TABLE train (
  tr_no     INT PRIMARY KEY,
  tr_name   VARCHAR(70) NOT NULL,
  from_stn  VARCHAR(20) NOT NULL,
  to_stn    VARCHAR(20) NOT NULL,
  seats     INT NOT NULL,
  fare      DECIMAL(6,2) NOT NULL
);

CREATE TABLE history (
  transid   VARCHAR(36) PRIMARY KEY,
  mailid    VARCHAR(40) REFERENCES customer(mailid),
  tr_no     INT,
  date      DATE,
  from_stn  VARCHAR(20) NOT NULL,
  to_stn    VARCHAR(20) NOT NULL,
  seats     INT NOT NULL,
  amount    DECIMAL(8,2) NOT NULL
);

INSERT INTO admin VALUES ('admin@demo.com','admin','System','Admin','Demo Address 123 colony',9874561230);
INSERT INTO customer VALUES ('sai@demo.com','sai123','Sai','Charan','Tirupati, Andhra Pradesh',9876543210);

INSERT INTO train VALUES (10001,'JODHPUR EXP','HOWRAH','JODHPUR', 152, 490.50);
INSERT INTO train VALUES (10002,'YAMUNA EXP','GAYA','DELHI', 52, 550.50);
INSERT INTO train VALUES (10003,'NILANCHAL EXP','GAYA','HOWRAH', 92, 451);
INSERT INTO train VALUES (10004,'JAN SATABDI EXP','RANCHI','PATNA', 182, 550);
INSERT INTO train VALUES (10005,'GANGE EXP','MUMBAI','KERALA', 12, 945);
INSERT INTO train VALUES (10006,'GARIB RATH EXP','PATNA','DELHI', 1, 1450.75);
INSERT INTO train VALUES (10008,'MUMBAI MAIL','HAWRAH','MUMBAI', 100, 2150.75);
INSERT INTO train VALUES (10007,'AJMER-SEALDAH EXP','SEALDAH','AJMER', 120, 1000.50);

INSERT INTO history VALUES ('BBC374-NSDF-4673','sai@demo.com',10001,'2024-02-02', 'HOWRAH', 'JODHPUR', 2, 981);
INSERT INTO history VALUES ('BBC375-NSDF-4675','sai@demo.com',10004,'2024-01-12', 'RANCHI', 'PATNA', 1, 550);
INSERT INTO history VALUES ('BBC373-NSDF-4674','sai@demo.com',10006,'2024-07-22', 'PATNA', 'DELHI', 3, 4352.25);
```

## 3. Point the app at your database

Open `src/application.properties` and set your own root password:

```
username=root
password=YOUR_MYSQL_ROOT_PASSWORD
driverName=com.mysql.cj.jdbc.Driver
connectionString=jdbc:mysql://localhost:3306/reservation?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
```

That's it — no cloud database, no API keys, nothing that can bill you later. Everything (JDK, Eclipse, Tomcat, MySQL) runs entirely on your own machine for free.
