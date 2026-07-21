#!/bin/bash
export PATH="/Users/thespahaus/Desktop/Claude/.toolchain/node/bin:$PATH"
cd "$(dirname "$0")"
exec npm run dev
