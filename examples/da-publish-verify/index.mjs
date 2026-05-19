// da-publish-verify — publish a payload to 0G DA, then verify it.
// Key-free: with no encoder configured, DA runs in deterministic local mode.
import { DA } from "@foundryprotocol/0gkit-da";

const da = new DA({ network: "galileo" });

const payload = { hello: "0G", at: new Date().toISOString() };

const result = await da.publish(payload);
console.log("mode:   ", result.mode); // "live" if an encoder is set, else "local"
console.log("digest: ", result.digest);
if (result.daRef) console.log("daRef:  ", result.daRef);

const ok = da.verify(payload, result.digest);
console.log("verify: ", ok ? "✓ payload matches digest" : "✗ mismatch");

if (!ok) process.exit(1);
