# KUMPLY L1 validator node — AvalancheGo + Subnet-EVM plugin
# Runs a Fuji L1 validator in ACP-77 partial-sync mode (tracks P-Chain + the
# KUMPLY subnet only; does not validate the Primary Network).

FROM alpine:3.20 AS plugin
RUN apk add --no-cache curl tar
RUN curl -fL -o /tmp/subnet-evm.tar.gz \
      https://github.com/ava-labs/subnet-evm/releases/download/v0.8.0/subnet-evm_0.8.0_linux_amd64.tar.gz \
 && tar -xzf /tmp/subnet-evm.tar.gz -C /tmp subnet-evm

FROM avaplatform/avalanchego:v1.14.1

# Subnet-EVM plugin, named by the KUMPLY chain's VMID
COPY --from=plugin /tmp/subnet-evm /avalanchego/build/plugins/pKtXEGFPZ1S5CFBf5yvu3S1WxcBm66Av3DassMRerNrEBi59a
