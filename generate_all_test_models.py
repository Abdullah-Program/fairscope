"""
Generates multiple test ML models + datasets for FairScope demos.
Each model has different bias patterns for interesting audit results.

Usage:
    python generate_all_test_models.py
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.tree import DecisionTreeClassifier
import joblib
import os

os.makedirs("ml_examples", exist_ok=True)

# ============================================================
# MODEL 1: Hiring Decision Model (Gender + Ethnicity Bias)
# ============================================================
print("\n🔨 Generating Model 1: Hiring Decision Model...")
np.random.seed(101)
n = 1000

years_experience = np.random.randint(0, 25, n)
education_level = np.random.choice([1, 2, 3, 4], n)  # 1=HS, 2=Bachelors, 3=Masters, 4=PhD
skills_score = np.random.normal(70, 15, n).clip(20, 100)
interview_score = np.random.normal(65, 20, n).clip(0, 100)
gender = np.random.choice([0, 1], n)          # 0=male, 1=female
ethnicity = np.random.choice([1, 2, 3], n)    # 3 groups

# Hiring logic with intentional gender bias
base = (
    (years_experience / 25) * 0.3
    + (education_level / 4) * 0.2
    + (skills_score / 100) * 0.25
    + (interview_score / 100) * 0.25
)
# Injected bias: females get a penalty, ethnicity group 3 gets a penalty
gender_penalty = np.where(gender == 1, -0.10, 0)
ethnicity_penalty = np.where(ethnicity == 3, -0.08, 0)
noise = np.random.normal(0, 0.06, n)
hired = ((base + gender_penalty + ethnicity_penalty + noise) > 0.50).astype(int)

df_hiring = pd.DataFrame({
    "years_experience": years_experience,
    "education_level": education_level,
    "skills_score": skills_score.round(1),
    "interview_score": interview_score.round(1),
    "gender": gender,
    "ethnicity": ethnicity,
    "hired": hired,
})

X_h = df_hiring.drop(columns=["hired"])
y_h = df_hiring["hired"]
model_hiring = GradientBoostingClassifier(
    n_estimators=120, max_depth=4, random_state=101
)
model_hiring.fit(X_h, y_h)

joblib.dump(model_hiring, "ml_examples/hiring_model.pkl")
df_hiring.to_csv("ml_examples/hiring_dataset.csv", index=False)
print(f"   ✅ hiring_model.pkl + hiring_dataset.csv ({n} rows)")
print(f"   Target: 'hired' | Sensitive: ['gender', 'ethnicity']")
print(f"   Bias: Gender penalty (-10%) + Ethnicity group 3 penalty (-8%)")

# ============================================================
# MODEL 2: Healthcare Risk Prediction (Race + Insurance Bias)
# ============================================================
print("\n🔨 Generating Model 2: Healthcare Risk Model...")
np.random.seed(202)
n = 900

age = np.random.randint(18, 85, n)
bmi = np.random.normal(27, 5, n).clip(15, 50)
blood_pressure = np.random.normal(120, 20, n).clip(80, 200)
cholesterol = np.random.normal(200, 40, n).clip(100, 350)
exercise_hours = np.random.uniform(0, 10, n)
smoker = np.random.choice([0, 1], n, p=[0.75, 0.25])
race = np.random.choice([1, 2, 3, 4], n)        # 4 groups
insurance_type = np.random.choice([1, 2, 3], n)  # 1=Private, 2=Public, 3=None

# Risk logic — mostly health-based, but with race + insurance bias baked in
health_score = (
    (age / 85) * 0.2
    + (bmi / 50) * 0.15
    + (blood_pressure / 200) * 0.2
    + (cholesterol / 350) * 0.15
    + (1 - exercise_hours / 10) * 0.1
    + smoker * 0.2
)
# Injected bias: race group 4 flagged more, uninsured flagged more
race_bias = np.where(race == 4, 0.12, 0)
insurance_bias = np.where(insurance_type == 3, 0.10, 0)
noise = np.random.normal(0, 0.05, n)
high_risk = ((health_score + race_bias + insurance_bias + noise) > 0.55).astype(int)

df_health = pd.DataFrame({
    "age": age,
    "bmi": bmi.round(1),
    "blood_pressure": blood_pressure.round(0),
    "cholesterol": cholesterol.round(0),
    "exercise_hours_weekly": exercise_hours.round(1),
    "smoker": smoker,
    "race": race,
    "insurance_type": insurance_type,
    "high_risk": high_risk,
})

X_hc = df_health.drop(columns=["high_risk"])
y_hc = df_health["high_risk"]
model_health = RandomForestClassifier(
    n_estimators=150, max_depth=5, random_state=202
)
model_health.fit(X_hc, y_hc)

joblib.dump(model_health, "ml_examples/healthcare_risk_model.pkl")
df_health.to_csv("ml_examples/healthcare_dataset.csv", index=False)
print(f"   ✅ healthcare_risk_model.pkl + healthcare_dataset.csv ({n} rows)")
print(f"   Target: 'high_risk' | Sensitive: ['race', 'insurance_type']")
print(f"   Bias: Race group 4 (+12%) + Uninsured (+10%) over-flagged")

# ============================================================
# MODEL 3: Credit Score Model (Age + Marital Status Bias)
# ============================================================
print("\n🔨 Generating Model 3: Credit Scoring Model...")
np.random.seed(303)
n = 1200

monthly_income = np.random.normal(4500, 2000, n).clip(800, 20000)
total_debt = np.random.normal(15000, 10000, n).clip(0, 80000)
num_credit_cards = np.random.randint(0, 10, n)
payment_history = np.random.uniform(0.5, 1.0, n)  # 0.5 = bad, 1.0 = perfect
employment_years = np.random.randint(0, 30, n)
age_group = np.random.choice([1, 2, 3], n)         # 1=Young(<30), 2=Mid(30-50), 3=Senior(50+)
marital_status = np.random.choice([0, 1, 2], n)    # 0=Single, 1=Married, 2=Divorced

# Credit score logic
debt_ratio = total_debt / (monthly_income * 12 + 1)
base_credit = (
    (1 - debt_ratio.clip(0, 1)) * 0.3
    + payment_history * 0.3
    + (employment_years / 30) * 0.2
    + (1 - num_credit_cards / 10) * 0.1
    + (monthly_income / 20000) * 0.1
)
# Injected bias: young people penalized, divorced people penalized
age_penalty = np.where(age_group == 1, -0.12, 0)
marital_penalty = np.where(marital_status == 2, -0.07, 0)
noise = np.random.normal(0, 0.04, n)
good_credit = ((base_credit + age_penalty + marital_penalty + noise) > 0.52).astype(int)

df_credit = pd.DataFrame({
    "monthly_income": monthly_income.round(0),
    "total_debt": total_debt.round(0),
    "num_credit_cards": num_credit_cards,
    "payment_history": payment_history.round(3),
    "employment_years": employment_years,
    "age_group": age_group,
    "marital_status": marital_status,
    "good_credit": good_credit,
})

X_cr = df_credit.drop(columns=["good_credit"])
y_cr = df_credit["good_credit"]
model_credit = DecisionTreeClassifier(max_depth=8, random_state=303)
model_credit.fit(X_cr, y_cr)

joblib.dump(model_credit, "ml_examples/credit_scoring_model.pkl")
df_credit.to_csv("ml_examples/credit_dataset.csv", index=False)
print(f"   ✅ credit_scoring_model.pkl + credit_dataset.csv ({n} rows)")
print(f"   Target: 'good_credit' | Sensitive: ['age_group', 'marital_status']")
print(f"   Bias: Young adults (-12%) + Divorced (-7%) penalized")

# ============================================================
# SUMMARY
# ============================================================
print("\n" + "=" * 60)
print("🎉 ALL TEST MODELS GENERATED SUCCESSFULLY!")
print("=" * 60)
print("""
📁 ml_examples/
│
├── loan_approval_model.pkl     (existing - RandomForest)
├── loan_dataset.csv            (800 rows)
│   Target: 'approved'
│   Sensitive: ['zip_code', 'gender']
│
├── hiring_model.pkl            (NEW - GradientBoosting)
├── hiring_dataset.csv          (1000 rows)
│   Target: 'hired'
│   Sensitive: ['gender', 'ethnicity']
│
├── healthcare_risk_model.pkl   (NEW - RandomForest)
├── healthcare_dataset.csv      (900 rows)
│   Target: 'high_risk'
│   Sensitive: ['race', 'insurance_type']
│
├── credit_scoring_model.pkl    (NEW - DecisionTree)
├── credit_dataset.csv          (1200 rows)
│   Target: 'good_credit'
│   Sensitive: ['age_group', 'marital_status']

🚀 Upload any model + dataset pair on FairScope to audit it!
""")
