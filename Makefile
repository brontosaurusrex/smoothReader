.PHONY: run serve check

run: serve

serve:
	python3 -m http.server 8000

check:
	node --check renderer-v33.js
	node test/smoke-renderer.js
	node test/vendor-archive.js
	python3 -m py_compile piper_bridge.py
	python3 test/piper-bridge.py
