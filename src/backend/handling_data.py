import pandas as pd
import numpy as np
from datetime import datetime
# used to standardize data from this csv file: 
# https://data.cityofnewyork.us/City-Government/Open-Parking-and-Camera-Violations/nc67-uf89/about_data
pd.set_option('display.max_columns', None)

standard_counties = {
    'Qns': 'Queens',
    'Q': 'Queens',
    'Kings': 'Brooklyn',
    'QN': 'Queens',
    'MN': 'Manhattan',
    'K': 'Brooklyn',
    'ST': 'Staten Island',
    'Queen': 'Queens',
    'MANHA': 'Manhattan',
    'BRONX': 'Bronx',
    'QUEENS': 'Queens',
    'BROOKLYN': 'Brooklyn',
    'BX': 'Bronx',
    'NY': 'Manhattan',
    'R': 'Staten Island'
}
parking = pd.read_csv("data/Parking Data.csv")

parking['County'] = parking['County'].replace(standard_counties)
parking['Violation Time'] = parking['Violation Time'].str.replace('A','AM')
parking['Violation Time'] = parking['Violation Time'].str.replace('P','PM')

def fix_time(time_str):
    substring = '00:'
    if substring in time_str:
        time_str = datetime.strptime(time_str,'%H:%M%p')
        time_str = datetime.strftime(time_str,'%H:%M')
        return time_str
    time_str = datetime.strptime(time_str,'%I:%M%p')
    time_str = datetime.strftime(time_str,'%H:%M')
    return time_str
parking['Violation Time'] = parking['Violation Time'].apply(fix_time) 
# download the csv file after changes
parking.to_csv('Parking2.csv', index=False, header=True)