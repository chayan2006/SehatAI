import os
import kagglehub
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
import joblib

# ── CONFIG ────────────────────────────────────────────────────────────────────
MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")
os.makedirs(MODEL_DIR, exist_ok=True)

# ── DOWNLOAD DATASET ──────────────────────────────────────────────────────────
print("Downloading Medical Cost dataset from Kaggle...")
path = kagglehub.dataset_download("mirichoi0218/insurance")
csv_path = os.path.join(path, "insurance.csv")
print(f"Dataset downloaded to: {csv_path}")

# ── LOAD AND PREPROCESS ───────────────────────────────────────────────────────
df = pd.read_csv(csv_path)
print(f"Data loaded: {len(df)} rows")

# One-hot encoding for categorical variables
df_encoded = pd.get_dummies(df, columns=['sex', 'smoker', 'region'], drop_first=True)

X = df_encoded.drop('charges', axis=1)
y = df_encoded['charges']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# ── TRAIN MODEL ───────────────────────────────────────────────────────────────
model = LinearRegression()
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"Mean Squared Error: {mse:.2f}")
print(f"R2 Score: {r2:.4f}")

# ── SAVE MODEL ────────────────────────────────────────────────────────────────
model_path = os.path.join(MODEL_DIR, "insurance_model.joblib")
joblib.dump(model, model_path)
print(f"✅ Model saved at: {model_path}")
