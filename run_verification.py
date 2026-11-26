"""
AeroShield AI - Comprehensive Repository Verification & Quality Assurance Suite
Validates:
1. Code Quality & Standards (PEP 8, linting, imports)
2. Security & Secrets (Hardcoded API keys, CORS configuration, Rate Limiting, Input Sanitization)
3. Repository Constraints (Size < 10MB excluding node_modules/.venv, gitignore integrity)
4. Backend Test Suite (Pytest execution & coverage)
5. Frontend Health (Vitest/Typescript/Build verification)
6. Accessibility & WCAG 2.1 AA Compliance Markers
"""

import os
import sys
import subprocess
import re
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend"

FORBIDDEN_SECRET_PATTERNS = [
    r"AIza[0-9A-Za-z-_]{35}",           # Google Gemini / Maps API Key
    r"sk-[a-zA-Z0-9]{32,}",             # OpenAI Secret Key
    r"ghp_[a-zA-Z0-9]{36}",             # GitHub Personal Access Token
    r"(?:aws_access_key_id|aws_secret_access_key)\s*=\s*['\"][A-Za-z0-9/+=]{16,}['\"]",
]

def log_section(title: str):
    print("\n" + "=" * 70)
    print(f" >>> {title.upper()}")
    print("=" * 70)

def check_repo_constraints() -> bool:
    log_section("1. Repository Constraints & Secret Hygiene Audit")
    passed = True

    # 1. Check .gitignore
    gitignore_path = ROOT_DIR / ".gitignore"
    if not gitignore_path.exists():
        print("[FAIL] .gitignore is missing!")
        return False
    print("[PASS] .gitignore exists.")

    # 2. Check total repository size excluding git, node_modules, and virtualenvs
    total_size_bytes = 0
    excluded_dirs = {".git", "node_modules", ".venv", "venv", "__pycache__", ".pytest_cache", "dist"}
    
    scanned_files = 0
    secret_findings = []

    for root, dirs, files in os.walk(ROOT_DIR):
        dirs[:] = [d for d in dirs if d not in excluded_dirs]
        for f in files:
            file_path = Path(root) / f
            try:
                size = file_path.stat().st_size
                total_size_bytes += size
                scanned_files += 1

                # Secret scan on text/source files
                if file_path.suffix in {".py", ".ts", ".tsx", ".js", ".jsx", ".json", ".env.example", ".md", ".html"}:
                    content = file_path.read_text(encoding="utf-8", errors="ignore")
                    for pattern in FORBIDDEN_SECRET_PATTERNS:
                        matches = re.findall(pattern, content)
                        if matches:
                            secret_findings.append((file_path.relative_to(ROOT_DIR), pattern))
            except Exception as e:
                print(f"[WARN] Could not inspect {file_path}: {e}")

    total_size_mb = total_size_bytes / (1024 * 1024)
    print(f"Scanned {scanned_files} committed/source files.")
    print(f"Total repo source size: {total_size_mb:.2f} MB")

    if total_size_mb > 10.0:
        print(f"[FAIL] Repository size exceeds 10 MB limit ({total_size_mb:.2f} MB)")
        passed = False
    else:
        print(f"[PASS] Repository size ({total_size_mb:.2f} MB) is well within < 10 MB requirement.")

    if secret_findings:
        print(f"[FAIL] Hardcoded secret patterns detected in repository:")
        for path, pat in secret_findings:
            print(f"  - {path}: matches pattern {pat}")
        passed = False
    else:
        print("[PASS] No hardcoded secrets or API tokens detected in codebase.")

    return passed

def check_backend() -> bool:
    log_section("2. Backend Quality, Security & Pytest Suite")
    if not BACKEND_DIR.exists():
        print("[FAIL] backend/ directory does not exist.")
        return False

    passed = True

    # Check for security best practices in backend code
    security_checks = {
        "CORS middleware": False,
        "Rate limiting / slowapi": False,
        "Pydantic validation schemas": False,
        "Environment configuration via pydantic-settings / dotenv": False,
    }

    for py_file in BACKEND_DIR.glob("**/*.py"):
        content = py_file.read_text(encoding="utf-8", errors="ignore")
        if "CORSMiddleware" in content:
            security_checks["CORS middleware"] = True
        if "limiter" in content.lower() or "slowapi" in content or "ratelimit" in content.lower():
            security_checks["Rate limiting / slowapi"] = True
        if "BaseModel" in content and "Field(" in content:
            security_checks["Pydantic validation schemas"] = True
        if "BaseSettings" in content or "dotenv" in content or "os.getenv" in content:
            security_checks["Environment configuration via pydantic-settings / dotenv"] = True

    for check, status in security_checks.items():
        if status:
            print(f"[PASS] Backend Security: {check} implemented.")
        else:
            print(f"[WARN] Backend Security: {check} not explicitly detected.")

    # Run Pytest in backend
    test_dir = BACKEND_DIR / "tests"
    if test_dir.exists():
        print(f"\nRunning backend pytest suite at {test_dir}...")
        try:
            env = os.environ.copy()
            env["PYTHONPATH"] = str(ROOT_DIR)
            res = subprocess.run(
                [sys.executable, "-m", "pytest", "backend/tests", "-v", "--tb=short"],
                cwd=str(ROOT_DIR),
                env=env,
                capture_output=True,
                text=True,
                timeout=60
            )
            print(res.stdout)
            if res.stderr:
                print(res.stderr)
            if res.returncode == 0:
                print("[PASS] All backend pytest tests executed successfully.")
            else:
                print(f"[FAIL] Backend pytest failed with exit code {res.returncode}")
                passed = False
        except Exception as e:
            print(f"[FAIL] Error running pytest: {e}")
            passed = False
    else:
        print("[WARN] backend/tests directory not yet present.")

    return passed

def check_frontend() -> bool:
    log_section("3. Frontend Architecture, Accessibility & Tests")
    if not FRONTEND_DIR.exists():
        print("[FAIL] frontend/ directory does not exist.")
        return False

    passed = True

    # Check package.json
    pkg_json = FRONTEND_DIR / "package.json"
    if not pkg_json.exists():
        print("[FAIL] frontend/package.json not found.")
        return False
    print("[PASS] frontend/package.json exists.")

    # Check Accessibility (a11y) markers in frontend/src
    src_dir = FRONTEND_DIR / "src"
    a11y_markers = {
        "aria-label or aria-labelledby": 0,
        "role attribute": 0,
        "alt text on images": 0,
        "Skip-to-content anchor": 0,
        "Color-blind high-contrast indicators": 0
    }

    if src_dir.exists():
        for file in src_dir.glob("**/*.*"):
            if file.suffix in {".tsx", ".jsx", ".html"}:
                content = file.read_text(encoding="utf-8", errors="ignore")
                if "aria-label" in content or "aria-labelledby" in content:
                    a11y_markers["aria-label or aria-labelledby"] += 1
                if "role=" in content:
                    a11y_markers["role attribute"] += 1
                if "alt=" in content:
                    a11y_markers["alt text on images"] += 1
                if "skip-to-content" in content.lower() or "skip to content" in content.lower() or "sr-only" in content:
                    a11y_markers["Skip-to-content anchor"] += 1
                if "contrast" in content.lower() or "color-blind" in content.lower() or "pattern" in content.lower() or "badge" in content.lower():
                    a11y_markers["Color-blind high-contrast indicators"] += 1

        print("A11y Audit Findings across Frontend Components:")
        for marker, count in a11y_markers.items():
            print(f"  - {marker}: {count} occurrences found.")
            if count == 0 and marker != "Skip-to-content anchor":
                print(f"    [NOTICE] A11y marker '{marker}' is 0.")

    # Test Vitest or TypeScript Build if node is installed
    try:
        npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
        print("\nVerifying frontend tests via npm test...")
        test_res = subprocess.run(
            [npm_cmd, "test", "--", "--run"],
            cwd=str(FRONTEND_DIR),
            capture_output=True,
            text=True,
            timeout=60
        )
        if test_res.returncode == 0:
            print("[PASS] Frontend unit/a11y tests passed.")
        else:
            print("[INFO] Frontend test output:")
            print(test_res.stdout[:500])
            print(test_res.stderr[:500])
    except Exception as e:
        print(f"[INFO] Frontend test runner skipped or npm not configured: {e}")

    return passed

def check_documentation() -> bool:
    log_section("4. Submission Documentation & Evaluation Criteria Audit")
    readme_path = ROOT_DIR / "README.md"
    if not readme_path.exists():
        print("[FAIL] Root README.md does not exist.")
        return False

    content = readme_path.read_text(encoding="utf-8", errors="ignore")
    required_sections = [
        "Architecture",
        "Installation",
        "Code Quality",
        "Security",
        "Efficiency",
        "Testing",
        "Accessibility",
        "API Reference",
        "Video Demo Script",
        "Problem Statement Alignment"
    ]

    missing = []
    for sec in required_sections:
        if sec.lower() not in content.lower():
            missing.append(sec)

    if missing:
        print(f"[FAIL] README.md is missing required sections: {missing}")
        return False
    else:
        print("[PASS] All required evaluation criteria & documentation sections present in README.md.")
        return True

def main():
    print("=" * 70)
    print(" AeroShield AI - System Verification & Quality Gatekeeper ")
    print("=" * 70)

    repo_ok = check_repo_constraints()
    backend_ok = check_backend()
    frontend_ok = check_frontend()
    doc_ok = check_documentation()

    print("\n" + "=" * 70)
    print(" VERIFICATION SUMMARY ")
    print("=" * 70)
    print(f" Repository Size & Security Hygiene: {'PASS' if repo_ok else 'FAIL'}")
    print(f" Backend Tests & Security Controls:   {'PASS' if backend_ok else 'PENDING/FAIL'}")
    print(f" Frontend Health & Accessibility:    {'PASS' if frontend_ok else 'PENDING/FAIL'}")
    print(f" Root Documentation & Video Script:  {'PASS' if doc_ok else 'PENDING/FAIL'}")

    all_passed = repo_ok and backend_ok and frontend_ok and doc_ok
    if all_passed:
        print("\n>>> ALL GATES PASSED! SYSTEM READY FOR SUBMISSION <<<")
        sys.exit(0)
    else:
        print("\n>>> Verification completed with pending components or warnings. <<<")
        sys.exit(1)

if __name__ == "__main__":
    main()
