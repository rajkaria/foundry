"""Configuration loaded from env."""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Deployment:
    forge_factory: str
    ingot: str
    revenue_splitter: str
    contribution_registry: str


@dataclass(frozen=True)
class Config:
    rpc_url: str
    coordinator_key: str
    deployment: Deployment
    storage_endpoint: str
    compute_endpoint: str
    tee_enabled: bool
    poll_interval_secs: float

    @classmethod
    def from_env(cls) -> "Config":
        deployment_file = os.environ.get(
            "DEPLOYMENT_FILE", "../contracts/deployments/aristotle.json"
        )
        path = Path(deployment_file)
        if path.exists():
            data = json.loads(path.read_text())
            deployment = Deployment(
                forge_factory=data["ForgeFactory"],
                ingot=data["Ingot"],
                revenue_splitter=data["RevenueSplitter"],
                contribution_registry=data["ContributionRegistry"],
            )
        else:
            deployment = Deployment("", "", "", "")

        return cls(
            rpc_url=os.environ.get("RPC_ARISTOTLE", "https://rpc.0g.network"),
            coordinator_key=os.environ.get("COORDINATOR_KEY", ""),
            deployment=deployment,
            storage_endpoint=os.environ.get(
                "ZG_STORAGE_ENDPOINT", "https://storage.0g.network"
            ),
            compute_endpoint=os.environ.get(
                "ZG_COMPUTE_ENDPOINT", "https://compute.0g.network"
            ),
            tee_enabled=os.environ.get("TEE_ENABLED", "true").lower() == "true",
            poll_interval_secs=float(os.environ.get("POLL_INTERVAL_SECS", "12")),
        )
