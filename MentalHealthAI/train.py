import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
import pickle

# Sample mental health dataset
data = {
    "study_hours": [2,4,6,8,10,12],
    "sleep_hours": [8,7,6,5,4,3],
    "screen_time": [2,4,6,8,10,12],
    "exercise_minutes": [60,45,30,20,10,0],
    "stress_level": [0,0,1,1,2,2]  # 0=Low, 1=Medium, 2=High
}

df = pd.DataFrame(data)

X = df.drop("stress_level", axis=1)
y = df["stress_level"]

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

model = LinearRegression()
model.fit(X_scaled, y)

pickle.dump(model, open("model.pkl", "wb"))
pickle.dump(scaler, open("scaler.pkl", "wb"))

print("Mental health model trained and saved.")
