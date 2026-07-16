# KUMPLY L1 Validator Node — Deploy Config

One-command validator node for the KUMPLY Compliance L1, verified working on
Fly.io (AvalancheGo v1.14.1 + Subnet-EVM v0.8.0, ACP-77 partial-sync mode).

This is **deploy-ready and proven** — the node was stood up, synced the Fuji
P-Chain to 100%, and produced a valid NodeID
(`NodeID-EzGaipqomyK9UKx9DBHV6Ky3y68hoknrF`). It is intentionally **not left
running**: a validator is a 24/7 commitment, and KUMPLY activates the live
consensus set as a funded milestone (external validators + redundancy), not a
single fragile node.

## What's here

- `Dockerfile` — AvalancheGo base image + Subnet-EVM plugin, named by the
  KUMPLY chain VMID.
- `fly.toml` — partial-sync validator config: tracks the Fuji P-Chain and the
  KUMPLY subnet only. Node API stays on `127.0.0.1` (reach it via `fly proxy`,
  never the public internet); only the P2P port (9651) is exposed.

## Bring it up

```bash
cd contracts/l1/node
fly launch --copy-config --no-deploy          # or `fly apps create kumply-l1-node`
fly ips allocate-v4 -a kumply-l1-node          # dedicated IPv4 for P2P
fly volumes create avago_data --size 30 -a kumply-l1-node -r dfw
fly deploy --ha=false
```

## Activate the L1 (ACP-77, once the node is synced)

The subnet control key (`kumply-deployer` in Avalanche CLI) signs the
conversion that points the P-Chain at `KumplyValidatorSetManager`:

```bash
avalanche blockchain deploy kumply --fuji         # ConvertSubnetToL1Tx
# then register this node's NodeID + BLS proof-of-possession as the first
# validator, gated by its Tier-4 (KYB) attestation.
```

Subnet: `2buHAwNvaybnQ6vQYRS4TeXizZhAo33bhpnonAJu21CKYLZoST`
Blockchain: `2pyvAQK1WQ318yHtnv4ZQeL9hWeJmmgMp9MEHqpJnDYttQEL6b` (chainId 43210)
