import re

with open('src/components/VariationsView.tsx', 'r') as f:
    content = f.read()

content = content.replace('const [useAi, setUseAi] = useState(true);', 'const [useAi, setUseAi] = useState(false);')

# Remove the AI Toggle block
pattern_toggle = r'              \{/\* AI Assistant check \*/\}.*?              \{/\* Manual Fields for IMPRESA and TECNICO'
content = re.sub(pattern_toggle, '              {/* Manual Fields for IMPRESA and TECNICO', content, flags=re.DOTALL)

content = content.replace('&& !useAi &&', '&&')

with open('src/components/VariationsView.tsx', 'w') as f:
    f.write(content)
