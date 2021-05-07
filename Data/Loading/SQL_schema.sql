CREATE TABLE Countries (
country_name VARCHAR,    
country_code VARCHAR PRIMARY KEY
    
);


CREATE TABLE Unemployment (    
    country_name VARCHAR,    
    country_code VARCHAR REFERENCES Countries(country_code),	
    ump_year INTEGER,
    unemployment_pct REAL    
);


CREATE TABLE Population (       
    country_name VARCHAR,
    country_code VARCHAR REFERENCES Countries(country_code),
    pop_year INTEGER,
    Population BIGINT
);


CREATE TABLE GDP (    
    country_name VARCHAR,
    country_code VARCHAR REFERENCES Countries(country_code),
    GDP_Year INTEGER,
    GDP_USD NUMERIC
);

CREATE TABLE CPI (
    country_name VARCHAR,
    country_code VARCHAR REFERENCES Countries(country_code),    
    CPI_Year INTEGER,
    CPI_2010_100 REAL
);
