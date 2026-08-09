import joblib
import sys
import os

# Set UTF-8 stdout encoding for Windows terminals
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

# Script to inspect any .pkl machine learning model file
file_path = sys.argv[1] if len(sys.argv) > 1 else "ml_examples/loan_approval_model.pkl"

if not os.path.exists(file_path):
    print(f"Error: File '{file_path}' not found.")
    sys.exit(1)

print("=" * 55)
print(f"INSPECTING PICKLE MODEL FILE: {file_path}")
print("=" * 55)

try:
    model = joblib.load(file_path)
    print(f"[+] Model Algorithm Class: {type(model).__name__}")
    print(f"[+] Module Path:            {type(model).__module__}")
    
    if hasattr(model, "n_estimators"):
        print(f"[+] Decision Trees Count:   {model.n_estimators}")
    if hasattr(model, "n_features_in_"):
        print(f"[+] Number of Features:     {model.n_features_in_}")
    if hasattr(model, "feature_names_in_"):
        print(f"[+] Feature Column Names:   {list(model.feature_names_in_)}")
    if hasattr(model, "classes_"):
        print(f"[+] Target Classes:         {list(model.classes_)}")

    print("\n[+] Model Hyperparameters:")
    for k, v in list(model.get_params().items())[:8]:
        print(f"    - {k}: {v}")

    print("=" * 55)
    print("SUCCESS: Model file loaded and verified!")
    print("=" * 55)

except Exception as e:
    print(f"[-] Failed to load model: {e}")
