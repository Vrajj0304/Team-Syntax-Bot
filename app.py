from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression

app = Flask(__name__)
CORS(app)

# 1. Load Datasets from untitled3.py references
temp_df = pd.read_csv('TEMP_ANNUAL_SEASONAL_MEAN.csv')
soil_df = pd.read_csv('sm_Gujarat_2018.csv')
pollution_df = pd.read_csv('3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69.csv') # Pollution data

@app.route('/api/current_metrics', methods=['GET'])
def get_metrics():
    city = request.args.get('city', 'ahmedabad').lower()
    
    # Logic to extract "current" (latest) values or model-derived values
    # In a real scenario, this would be the output of your best-performing models
    # identified in untitled3.py (e.g., Gradient Boosting for Soil)
    
    data = {
        "ahmedabad": {
            "current_temp": 24, "aqi": 76, "soil_moisture": 42, "precip": 15,
            "humidity": 65, "wind": 12, "max_temp": 38, "min_temp": 18,
            "no2": 18.5, "anomalies": 1
        },
        "mumbai": {
            "current_temp": 28, "aqi": 82, "soil_moisture": 38, "precip": 20,
            "humidity": 75, "wind": 18, "max_temp": 35, "min_temp": 22,
            "no2": 24.1, "anomalies": 2
        },
        "delhi": {
            "current_temp": 26, "aqi": 165, "soil_moisture": 35, "precip": 10,
            "humidity": 55, "wind": 14, "max_temp": 40, "min_temp": 16,
            "no2": 48.3, "anomalies": 5
        }
    }
    
    result = data.get(city, data["ahmedabad"])
    return jsonify(result)

if __name__ == '__main__':
    app.run(port=5000, debug=True)
