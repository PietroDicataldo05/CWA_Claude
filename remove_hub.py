import re

with open('src/components/DashboardView.tsx', 'r') as f:
    content = f.read()

# Remove states
content = re.sub(
    r'  const \[actionFeedback, setActionFeedback\] = useState<string \| null>\(null\);\n  const \[technicalInput, setTechnicalInput\] = useState<string>\(""\);\n  const \[finalCostInput, setFinalCostInput\] = useState<string>\("1800"\);\n  const \[isVerifyingIntegrity, setIsVerifyingIntegrity\] = useState<boolean>\(false\);\n  const \[integrityChecked, setIntegrityChecked\] = useState<boolean>\(false\);\n',
    '', content
)

# Remove helper functions and specific variations
content = re.sub(
    r'  // Trigger feedback banner\n  const triggerFeedback = \(msg: string\) => \{\n    setActionFeedback\(msg\);\n    setTimeout\(\(\) => \{\n      setActionFeedback\(null\);\n    \}, 5000\);\n  \};\n\n  // Integrity Check Animation\n  const runIntegrityCheck = \(\) => \{\n    setIsVerifyingIntegrity\(true\);\n    setIntegrityChecked\(false\);\n    setTimeout\(\(\) => \{\n      setIsVerifyingIntegrity\(false\);\n      setIntegrityChecked\(true\);\n      triggerFeedback\("Verifica completata: Tutte le impronte crittografiche \(SHA-256\) e le firme digitali CAD sono integre ed asseverate ai sensi dell\'art. 20 del CAD."\);\n    \}, 2000\);\n  \};\n\n  // Specific variations in database\n  const var002 = variations.find\(\(v\) => v.id === "var-002"\);\n  const var003 = variations.find\(\(v\) => v.id === "var-003"\);\n',
    '', content
)

# Remove the dynamic action hub block
# It starts at `      {/* 1. Dynamic Role Action Hub / Centro Decisionale Cantiere */}`
# And ends before `      {/* 2. KPIs Grid */}`
content = re.sub(
    r'      \{/\* 1\. Dynamic Role Action Hub / Centro Decisionale Cantiere \*/\}.*?(?=      \{/\* 2\. KPIs Grid \*/\})',
    '', content, flags=re.DOTALL
)

with open('src/components/DashboardView.tsx', 'w') as f:
    f.write(content)

