"""
Generates a small synthetic "loan approval" dataset + trains a
RandomForest model on it, intentionally baking in a mild bias
towards zip_code so FairScope has something interesting to detect
in the demo. Run this once before testing the app.

Usage:
    python generate_sample_model.py
"""
import sys
import os

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

np.random.seed(42)
n = 800

income = np.random.normal(55000, 15000, n).clip(15000, 150000)
credit_score = np.random.normal(650, 80, n).clip(300, 850)
age = np.random.randint(21, 70, n)
loan_amount = np.random.normal(20000, 8000, n).clip(1000, 60000)
zip_code = np.random.choice([1, 2, 3, 4], n)  # 4 synthetic zip regions
gender = np.random.choice([0, 1], n)  # 0 = male, 1 = female (encoded)

# Ground truth approval logic — mostly income/credit based,
# but with an intentional (unfair) zip_code penalty for region 4
base_score = (
    (income / 150000) * 0.5
    + (credit_score / 850) * 0.4
    + (1 - loan_amount / 60000) * 0.1
)
zip_penalty = np.where(zip_code == 4, -0.15, 0)  # bias injected here
final_score = base_score + zip_penalty + np.random.normal(0, 0.05, n)

approved = (final_score > 0.5).astype(int)

df = pd.DataFrame({
    "income": income.round(0),
    "credit_score": credit_score.round(0),
    "age": age,
    "loan_amount": loan_amount.round(0),
    "zip_code": zip_code,
    "gender": gender,
    "approved": approved,
})

X = df.drop(columns=["approved"])
y = df["approved"]

model = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)
model.fit(X, y)

os.makedirs("ml_examples", exist_ok=True)
joblib.dump(model, "ml_examples/loan_approval_model.pkl")
df.to_csv("ml_examples/loan_dataset.csv", index=False)

print("[+] Sample model + dataset generated in ml_examples/")
print(f"    - loan_approval_model.pkl")
print(f"    - loan_dataset.csv  ({len(df)} rows)")
print(f"    - Target column: 'approved'")
print(f"    - Sensitive features: ['zip_code', 'gender']")
