"""Unpack/repack VibeFlow's two embedded apps without changing storage contracts.

python release_tools.py unpack index.html editable
python release_tools.py pack editable rebuilt.html
No network access or extra Python packages required.
"""
from pathlib import Path
import argparse
import base64
import hashlib
import re

LABELS = {'WORKFLOW_HTML_BASE64': 'workflow.html', 'PROMPT_HTML_BASE64': 'prompt-ide.html'}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['unpack', 'pack'])
    parser.add_argument('source', type=Path)
    parser.add_argument('destination', type=Path)
    args = parser.parse_args()
    if args.destination.exists():
        raise SystemExit('Destination already exists; choose a new path to preserve prior work.')
    if args.action == 'unpack':
        shell = args.source.read_text(encoding='utf-8')
        decoded = {}
        for label, name in LABELS.items():
            match = re.search(r"(const " + label + r"\s*=\s*')([^']+)(')", shell)
            if not match:
                raise SystemExit('Missing embedded app: ' + label)
            decoded[name] = base64.b64decode(match[2], validate=True)
            shell = shell[:match.start(2)] + '__' + label + '__' + shell[match.end(2):]
        args.destination.mkdir(parents=True)
        (args.destination / 'shell.html').write_bytes(shell.encode('utf-8'))
        for name, data in decoded.items():
            (args.destination / name).write_bytes(data)
    else:
        shell = (args.source / 'shell.html').read_text(encoding='utf-8')
        for label, name in LABELS.items():
            marker = '__' + label + '__'
            if shell.count(marker) != 1:
                raise SystemExit('Missing or duplicated marker: ' + marker)
            shell = shell.replace(marker, base64.b64encode((args.source / name).read_bytes()).decode('ascii'))
        args.destination.parent.mkdir(parents=True, exist_ok=True)
        args.destination.write_bytes(shell.encode('utf-8'))
        print('SHA256', hashlib.sha256(args.destination.read_bytes()).hexdigest())

if __name__ == '__main__':
    main()
