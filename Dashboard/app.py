import numpy as np
import pandas as pd
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func
from flask import Flask, render_template, jsonify
from flask import Flask
        
engine = create_engine("postgresql://postgres:postgres@localhost:5432/economy_db")

Base = automap_base()
Base.prepare(engine, reflect=True)

Countries = Base.classes.countries
Unemployment = Base.classes.unemployment
Population = Base.classes.population
Gdp = Base.classes.gdp
Cpi = Base.classes.cpi
Gdp2 = Base.classes.gdpp
Inflation = Base.classes.inflations

# Flask Setup
#################################################
app = Flask(__name__)

#################################################
# Flask Routes
#################################################

@app.route("/beeswarm")
def beeswarm():
    return render_template('gdp_unemp.html')

@app.route("/appbeeswarm")
def appbeeswarm():
    session = Session(engine)
    results = session.query(Countries.country_name,Countries.country_code,Gdp.gdp_year,Gdp.country_code,Countries.color,Unemployment.unemployment_pct,Unemployment.ump_year, Gdp.gdp_usd)\
                                    .filter(Unemployment.country_code == Countries.country_code)\
                                    .filter(Unemployment.country_code == Gdp.country_code,Unemployment.ump_year == Gdp.gdp_year)
    columns = [result['name'] for result in results.column_descriptions] 
    row2dict = lambda r: {c:val for c,val in zip(columns,r)}
    df_df = pd.DataFrame([row2dict(rez) for rez in results])
    countries_df = df_df[["country_code","country_name","color"]].drop_duplicates()
    countries_dict= countries_df.set_index("country_code").to_dict(orient="index")
    get_countryname= {key:val["country_name"] for key, val in countries_dict.items()}
    get_color= {key:val["color"] for key, val in countries_dict.items()}
    


    # result_list = df_df.to_dict(orient="records")
    # return jsonify(result_list)
    unemployment_df = df_df.pivot(index='country_code',columns= 'ump_year', values= 'unemployment_pct').rename(columns={col:f"unemp_{col}" for col in df_df.ump_year.unique()})
    gdp_df = df_df.pivot(index='country_code',columns= 'ump_year', values= 'gdp_usd').rename(columns={col:f"gdp_{col}" for col in df_df.ump_year.unique()}).applymap(float)
    combined_df = gdp_df.join(unemployment_df).assign(color= gdp_df.index.map(get_color.get),country_name= gdp_df.index.map(get_countryname.get)).reset_index().rename(columns={"country_name": "CountryName", "country_code": "CountryCode"})
    result_list = combined_df.to_dict(orient="records")

    session.close()

    return jsonify(result_list)

 

@app.route("/Phillips")
def Phillips():
    return render_template('inflation_unemp.html')

@app.route("/appPhillips")
def appPhillips(): 
    session = Session(engine)
    results2= session.query(Inflation.country_name,Inflation.unemployment,Inflation.country_code,Inflation.the_year,Inflation.inflation,Inflation.population,Inflation.color).all()
    
    renames = {"unemployment": "Unemployment", "the_year": "Year", "inflation":"Inflation","population":"Population", "color":"Color", "country_name":"country_name","country_code":"country_code"}
    results_list2 = [dict(rez) for rez in (results2)]

    results_list4 = [{ renames[key]: value for key,value in result.items()} for result in results_list2]

    session.close()


    return jsonify(results_list4)



@app.route("/barchartrace")
def barchartrace():
    return render_template('gdp.html')

@app.route("/appBar")
def appBar():
    session = Session(engine)
    results3 = session.query(Gdp2.name,Gdp2.country_code,Gdp2.year,Gdp2.value,Gdp2.lastvalue).all()

    renames = {"name": "name", "year": "year", "value":"value","lastvalue":"lastValue", "country_code":"country_code"}
    results_list5 = [dict(rez) for rez in (results3)]

    results_list5 = [{ renames[key]: int(value) if "value" in key else value for key,value in result.items()} for result in results_list5]
    

    session.close()


    return jsonify(results_list5)


@app.route("/choropleth")
def choropleth():
    return render_template('population.html')


@app.route("/")
def welcome():
   
    return render_template('index.html')

@app.route("/resources")
def appresources():
    return render_template('resources.html')


def fixed_gdp(rez):
    data = dict(rez)
    data["gdp_usd"] = float(data["gdp_usd"])
    return data

# @app.route("/choropleth")
# def choropleth():
#     return render_template('gdp.html')

# @app.route("/appBar")
# def appBar():
#     session = Session(engine)
#     results3 = session.query(Gdp2.name,Gdp2.country_code,Gdp2.year,Gdp2.value,Gdp2.lastvalue).all()

#     results_list3 = [dict(rez) for rez in (results_list3)]

#     session.close()


#     return jsonify(results_list3)


if __name__ == '__main__':
    app.run(debug=True)