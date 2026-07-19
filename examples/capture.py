import json
import os
import sys
import urllib.error
import urllib.request


if len(sys.argv) not in (2, 3) or not os.environ.get("LATCHSHOT_API_KEY"):
    raise SystemExit(
        "Usage: LATCHSHOT_API_KEY=... python3 examples/capture.py URL [OUTPUT.png]"
    )

target = sys.argv[1]
output = sys.argv[2] if len(sys.argv) == 3 else "capture.png"
request = urllib.request.Request(
    "https://latchshot.fly.dev/v1/render",
    data=json.dumps(
        {"url": target, "format": "png", "width": 1440, "height": 900}
    ).encode(),
    headers={
        "Authorization": f"Bearer {os.environ['LATCHSHOT_API_KEY']}",
        "Content-Type": "application/json",
    },
    method="POST",
)

try:
    with urllib.request.urlopen(request, timeout=45) as response:
        body = response.read()
        with open(output, "xb") as artifact:
            artifact.write(body)
        print(
            json.dumps(
                {
                    "output": output,
                    "bytes": len(body),
                    "renderMs": response.headers.get("X-Latchshot-Render-Ms"),
                    "remaining": response.headers.get("X-Quota-Remaining"),
                }
            )
        )
except urllib.error.HTTPError as error:
    raise SystemExit(
        f"Latchshot returned HTTP {error.code}: {error.read().decode(errors='replace')}"
    ) from error
