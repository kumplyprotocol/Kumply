import os

rules_files = ['.cursorrules', '.windsurfrules', '.clinerules']
for f in rules_files:
    if os.path.exists(f):
        with open(f, 'r') as file:
            content = file.read()
        content = content.replace('Última actualización: 14 Mayo 2026', 'Última actualización: 17 Mayo 2026')
        content = content.replace('85 tests (40 contracts + 30 SDK + 15 API)', '134 tests (87 contracts + 30 SDK + 17 API)')
        content = content.replace('Wagmi', 'Reown AppKit + Wagmi')
        with open(f, 'w') as file:
            file.write(content)

with open('CLAUDE.md', 'r') as file:
    content = file.read()
content = content.replace(
    '> Última actualización: 17 Mayo 2026 — 134 tests passing (87 contracts + 30 SDK + 17 API). KUMPLY Compliance L1 (Live on Fuji Testnet) agregado. Nueva página `/docs` y rebrand a `kumply.xyz`. Ver [`L1.md`](./L1.md).',
    '> Última actualización: 17 Mayo 2026 — 134 tests passing (87 contracts + 30 SDK + 17 API). KUMPLY Compliance L1 indexado en Avascan Subnets Testnet. Migración completada a Reown AppKit. Rebrand a modelo SaaS Software-Only. Ver [`L1.md`](./L1.md).'
)
content = content.replace(
    '### Wagmi / Web3\n- Config en `src/providers/Web3Provider.tsx`\n- Solo `avalancheFuji` chain\n- Connectors: `injected({ target: "metaMask" })` + `injected()`',
    '### Reown AppKit / Web3\n- Config en `src/providers/Web3Provider.tsx` con Project ID de Reown\n- Redes: `avalancheFuji` y KUMPLY Compliance L1 (`chainId: 43210`)\n- Hooks: `useAppKit` para abrir modal, y hooks de wagmi para estado on-chain'
)
with open('CLAUDE.md', 'w') as file:
    file.write(content)

with open('claude_estrategico.md', 'r') as file:
    content = file.read()
content = content.replace('40 contratos + 30 SDK + 15 API = **85 tests**', '87 contratos + 30 SDK + 17 API = **134 tests**')
with open('claude_estrategico.md', 'w') as file:
    file.write(content)
