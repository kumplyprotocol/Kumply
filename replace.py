import os
import re

files_to_fix = [
    "docs/submissions/MARKETING.md",
    "docs/submissions/team1.md",
    "docs/submissions/retro9000.md",
    "docs/submissions/RUNBOOK_ONCHAIN.md",
    "claude_estrategico.md",
    "contracts/l1/genesis.json",
    "pnpm-lock.yaml",
    "contracts/scripts/deploy.ts",
    "contracts/scripts/deploy-validator-manager.ts",
    "contracts/test/KumplyValidatorSetManager.test.ts",
    "contracts/test/ComplianceGate.test.ts",
    "contracts/test/AttestationStore.test.ts",
    "apps/web/src/app/api/webhook/route.ts",
    "apps/api/src/index.ts"
]

replacements = [
    (r'fintechs', 'enterprises'),
    (r'Fintechs', 'Enterprises'),
    (r'fintech', 'enterprise'),
    (r'Fintech', 'Enterprise'),
    (r'ITF/IFPE/Actividad Vulnerable', 'regulated financial'),
    (r'ITF/IFPE', 'regulated financial frameworks'),
    (r'ITFs', 'enterprises'),
    (r'ITF', 'enterprise'),
]

for file_path in files_to_fix:
    full_path = os.path.join('/home/vaiosvaios/Kumply', file_path)
    if not os.path.exists(full_path):
        continue
    
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original = content
    for old, new in replacements:
        content = re.sub(old, new, content)
        
    if content != original:
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file_path}")

