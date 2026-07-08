#!/usr/bin/env python3
import json
import sys

text = sys.stdin.read()
idx = text.find("{")
while idx != -1:
    try:
        obj, _ = json.JSONDecoder().raw_decode(text, idx)
        if "title" in obj or "skip" in obj:
            print(json.dumps(obj))
            sys.exit(0)
    except json.JSONDecodeError:
        pass
    idx = text.find("{", idx + 1)

sys.exit(1)
